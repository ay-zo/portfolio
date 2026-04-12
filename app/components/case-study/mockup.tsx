/**
 * Mockup
 *
 * Purpose:
 * Displays a case-study mockup image over a gradient background sampled
 * from the image's dominant colors.
 *
 * UX notes:
 * - Desktop / landscape mobile: image is offset toward the inner edge of the
 *   row (direction set by `align`) for a perspective feel.
 * - Portrait mobile: image is centered both horizontally and vertically at
 *   85% of the container height so it fits the narrower 1/3-height slot.
 */

"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface MockupProps {
  className?: string;
  id: string;
  align: "left" | "right";
}

export default function Mockup({ className, id, align }: MockupProps) {
  const [gradient, setGradient] = useState<{
    from: string;
    to: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/mockup-gradient?image=/image/case-mockup/${id}.png`)
      .then((res) => res.json())
      .then(setGradient);
  }, [id]);

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-3xl corner-smoothing-[0.6]",
        className || "",
      )}
      style={{
        backgroundImage: gradient
          ? `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`
          : undefined,
      }}
    >
      <img
        src={`/image/case-mockup/${id}.png`}
        alt={id}
        className={cn(
          "absolute",
          "portrait:max-lg:left-1/2 portrait:max-lg:top-1/2 portrait:max-lg:-translate-x-1/2 portrait:max-lg:-translate-y-1/2 portrait:max-lg:h-[85%] portrait:max-lg:w-auto",
          "landscape:top-1/2 landscape:-translate-y-1/2 landscape:h-150",
          "lg:top-1/2 lg:-translate-y-1/2 lg:h-150",
          align === "left"
            ? "landscape:-right-1/8 lg:-right-1/8"
            : "landscape:-left-1/8 lg:-left-1/8",
        )}
      />
      <div
        className={cn(
          "flex flex-row items-center gap-2 absolute text-muted text-label-sm tracking-wide whitespace-nowrap",

          // Mobile → centered
          "portrait:max-lg:bottom-1 portrait:max-lg:left-1/2 portrait:max-lg:-translate-x-1/2 portrait:max-lg:text-center",

          // Desktop → edge aligned
          "bottom-3",
          align === "left" ? "lg:left-6" : "lg:right-6",
        )}
      >
        <Lock className="w-3 h-3 text-muted" />
        <p>Product visuals adapted to protect client confidentiality.</p>
      </div>
    </div>
  );
}
