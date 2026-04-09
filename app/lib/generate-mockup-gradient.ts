import sharp from "sharp";
import path from "path";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

export async function generateMockupGradient(
  imagePath: string,
): Promise<[string, string]> {
  const normalized = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(process.cwd(), "public", normalized);

  const { data, info } = await sharp(fullPath)
    .resize(280, null, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  const interiorPixels = sampleInteriorRegion(data, width, height, channels);
  const dominantNeutral = findDominantNeutralColor(interiorPixels);
  const dominantAccent = findDominantAccentColor(interiorPixels);

  const neutralHsl = rgbToHsl(dominantNeutral);
  const accentHsl = dominantAccent ? rgbToHsl(dominantAccent) : undefined;

  return deriveGradientStopsFromScreen(neutralHsl, accentHsl);
}

// ---------------------------------------------------------------------------
// Pixel sampling
// ---------------------------------------------------------------------------

function sampleInteriorRegion(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): RGB[] {
  // Pull lower than browser chrome and closer to the actual app canvas.
  const startX = Math.round(width * 0.16);
  const endX = Math.round(width * 0.84);
  const startY = Math.round(height * 0.22);
  const endY = Math.round(height * 0.82);

  const pixels: RGB[] = [];

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * channels;
      pixels.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      });
    }
  }

  return pixels;
}

// ---------------------------------------------------------------------------
// Dominant color extraction
// ---------------------------------------------------------------------------

function findDominantNeutralColor(pixels: RGB[]): RGB {
  const BUCKET_SIZE = 20;

  const filtered = pixels.filter((pixel) => {
    const hsl = rgbToHsl(pixel);

    const notTooDark = hsl.l > 0.08;
    const notTooBright = hsl.l < 0.92;
    const lowToMidSaturation = hsl.s < 0.28;

    return notTooDark && notTooBright && lowToMidSaturation;
  });

  const source = filtered.length > 0 ? filtered : pixels;

  return (
    findDominantBucketAverage(source, BUCKET_SIZE) ?? {
      r: 36,
      g: 42,
      b: 56,
    }
  );
}

function findDominantAccentColor(pixels: RGB[]): RGB | null {
  const BUCKET_SIZE = 20;

  const filtered = pixels.filter((pixel) => {
    const hsl = rgbToHsl(pixel);

    const visibleEnough = hsl.l > 0.2 && hsl.l < 0.82;
    const saturatedEnough = hsl.s > 0.28;

    // Prefer blue / cyan / teal families for product-style dashboards,
    // but still allow any strong accent through.
    const hueDeg = hsl.h * 360;
    const blueFamily =
      (hueDeg >= 180 && hueDeg <= 255) || (hueDeg >= 255 && hueDeg <= 310);

    return visibleEnough && saturatedEnough && blueFamily;
  });

  const source =
    filtered.length >= 24
      ? filtered
      : pixels.filter((pixel) => {
          const hsl = rgbToHsl(pixel);
          return hsl.l > 0.2 && hsl.l < 0.82 && hsl.s > 0.32;
        });

  if (source.length < 24) return null;

  return findDominantBucketAverage(source, BUCKET_SIZE);
}

function findDominantBucketAverage(
  pixels: RGB[],
  bucketSize: number,
): RGB | null {
  const buckets = new Map<
    string,
    { count: number; rSum: number; gSum: number; bSum: number }
  >();

  for (const { r, g, b } of pixels) {
    const key = `${Math.floor(r / bucketSize)},${Math.floor(g / bucketSize)},${Math.floor(b / bucketSize)}`;
    const entry = buckets.get(key);

    if (entry) {
      entry.count += 1;
      entry.rSum += r;
      entry.gSum += g;
      entry.bSum += b;
    } else {
      buckets.set(key, {
        count: 1,
        rSum: r,
        gSum: g,
        bSum: b,
      });
    }
  }

  let best: { count: number; rSum: number; gSum: number; bSum: number } | null =
    null;

  for (const entry of buckets.values()) {
    if (!best || entry.count > best.count) {
      best = entry;
    }
  }

  if (!best) return null;

  return {
    r: Math.round(best.rSum / best.count),
    g: Math.round(best.gSum / best.count),
    b: Math.round(best.bSum / best.count),
  };
}

// ---------------------------------------------------------------------------
// Gradient derivation
// ---------------------------------------------------------------------------

function deriveGradientStopsFromScreen(
  neutralHsl: HSL,
  accentHsl?: HSL,
): [string, string] {
  const isDarkUI = neutralHsl.l < 0.46;

  const neutralIsAchromatic = neutralHsl.s < 0.02;
  const accentIsAchromatic = !accentHsl || accentHsl.s < 0.08;
  const isTrulyGrayscale = neutralIsAchromatic && accentIsAchromatic;

  // Stronger accent pull, especially for dark UI.
  const baseHue = accentHsl
    ? steerHue(neutralHsl.h, accentHsl.h, isDarkUI ? 0.62 : 0.28)
    : neutralHsl.h;

  if (!isDarkUI) {
    const baseS = isTrulyGrayscale
      ? 0
      : clamp(
          Math.max(neutralHsl.s * 0.8, accentHsl ? accentHsl.s * 0.18 : 0),
          0.05,
          0.22,
        );

    const fromHSL: HSL = {
      h: baseHue,
      s: baseS * 0.9,
      l: clamp(neutralHsl.l + 0.16, 0.9, 0.98),
    };

    const toHSL: HSL = {
      h: baseHue,
      s: clamp(baseS * 1.08, 0, 0.24),
      l: clamp(neutralHsl.l + 0.06, 0.8, 0.92),
    };

    return [hslToHex(fromHSL), hslToHex(toHSL)];
  }

  // This is the main dark-mode tuning knob.
  // Increase these values if you want more blue.
  const darkBaseS = isTrulyGrayscale
    ? 0
    : clamp(
        Math.max(neutralHsl.s * 0.95, accentHsl ? accentHsl.s * 0.42 : 0),
        0.12,
        0.34,
      );

  const fromHSL: HSL = {
    h: baseHue,
    s: darkBaseS * 0.96,
    l: clamp(neutralHsl.l + 0.01, 0.16, 0.28),
  };

  const toHSL: HSL = {
    h: baseHue,
    s: clamp(darkBaseS * 1.08, 0, 0.38),
    l: clamp(fromHSL.l - 0.06, 0.08, 0.2),
  };

  return [hslToHex(fromHSL), hslToHex(toHSL)];
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function steerHue(from: number, to: number, amount: number): number {
  let delta = to - from;

  if (delta > 0.5) delta -= 1;
  if (delta < -0.5) delta += 1;

  let result = from + delta * amount;

  if (result < 0) result += 1;
  if (result > 1) result -= 1;

  return result;
}

// ---------------------------------------------------------------------------
// Color-space conversions
// ---------------------------------------------------------------------------

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === rn) {
    h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  } else if (max === gn) {
    h = ((bn - rn) / d + 2) / 6;
  } else {
    h = ((rn - gn) / d + 4) / 6;
  }

  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}
