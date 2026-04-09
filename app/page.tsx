/**
 * HomePage
 *
 * Purpose:
 * Landing page that displays a fullscreen 3D Spline scene as an immersive
 * background with an aurora-style radial gradient overlay.
 *
 * Responsibilities:
 * - Compose the SplineScene 3D component
 * - Render the atmospheric gradient backdrop using brand palette tokens
 *
 * Data sources:
 * - None; purely presentational
 *
 * UX notes:
 * - The gradient is rendered as a decorative pseudo-layer behind the scene,
 *   blurred and scaled to create a soft aurora halo effect
 * - Hero-only decorative layers fade away as users scroll into work samples
 *
 * Domain notes:
 * - Brand colors (--color-brand-primary, --color-brand-secondary) drive the
 *   gradient stops via oklch relative color syntax for tonal control
 */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import SplineScene from "./components/SplineScene";
import CaseRow from "./components/case-study/case-row";
import { useCasePreviews } from "./hooks/use-case-previews";
import ScrollIndicator from "./components/scroll-indicator";

/**
 * Renders the landing page.
 *
 * Behavior:
 * - Mounts the 3D scene as a fullscreen canvas
 * - Overlays a blurred multi-layer radial gradient anchored to the bottom-right
 *   to create the "aurora" atmospheric effect
 * - Applies a shared scroll-driven fade to hero-only decorative elements
 *
 * Keep this component focused on:
 * - page-level composition
 * - visual atmosphere
 *
 * Avoid placing interaction or data-fetching logic here.
 */
export default function Home() {
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(1);

  const { data: casePreviews } = useCasePreviews();

  useEffect(() => {
    /**
     * Captures current viewport height so fade timing always maps to the first
     * 100vh, even after resize changes.
     */
    const syncViewportHeight = () => {
      setViewportHeight(window.innerHeight || 1);
    };

    syncViewportHeight();
    window.addEventListener("resize", syncViewportHeight);

    return () => window.removeEventListener("resize", syncViewportHeight);
  }, []);

  /**
   * Maps scroll progress across the first viewport height into an ease-in
   * fade curve for decorative hero elements.
   */
  const heroDecorationOpacity = useTransform(scrollY, (currentScrollY) => {
    const progress = Math.min(Math.max(currentScrollY / viewportHeight, 0), 1);
    return (1 - progress) * (1 - progress);
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-x-hidden">
      {/* Aurora gradient backdrop — blurred and oversized to bleed past edges */}
      <motion.div
        className="pointer-events-none absolute top-[-20%] bottom-[-20%] left-1/2 -translate-x-1/2 w-screen max-w-screen mb-20 -z-10"
        style={{
          opacity: heroDecorationOpacity,
          background: `
      radial-gradient(
        ellipse 88% 28% at 88% 92%,
        oklch(from var(--color-brand-primary) l c h / 0.95) 0%,
        oklch(from var(--color-brand-primary) l c h / 0.75) 20%,
        oklch(from var(--color-brand-secondary) l c h / 0.35) 45%,
        oklch(from var(--color-brand-secondary) l c h / 0) 72%
      ),
      radial-gradient(
        ellipse 5% 35% at 92% 102%,
        oklch(from var(--color-brand-primary) l c h / 0.55) 0%,
        oklch(from var(--color-brand-secondary) l c h / 0.28) 30%,
        oklch(from var(--color-brand-secondary) l c h / 0.10) 55%,
        oklch(from var(--color-brand-secondary) l c h / 0) 80%
      ),
      radial-gradient(
        ellipse 25% 120% at 70% 115%,
        oklch(from var(--color-brand-primary) l c h / 0.35) 0%,
        oklch(from var(--color-brand-secondary) l c h / 0.25) 35%,
        oklch(from var(--color-brand-secondary) l c h / 0) 80%
      ),
      #111318
    `,
          backgroundSize: "112% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(5em)",
        }}
      />
      <div className="relative flex min-h-screen max-h-screen w-full items-center justify-center overflow-hidden font-sans">
        <SplineScene />
        <div className="absolute bottom-0 left-0 w-full h-full flex">
          <div className="flex flex-col items-center justify-center items-start w-full px-36 gap-6">
            <div className="flex flex-col items-start justify-center">
              <p className="font-label text-label-lg uppercase font-medium text-brand-primary-muted leading-label">
                UX Designer // Currently building @ BCG X
              </p>
              <h1 className="text-hero font-semibold text-white flex flex-row items-center gap-4 leading-hero">
                Hey, I&apos;m
                <p className="bg-gradient-to-r from-brand-secondary to-brand-primary-muted text-transparent bg-clip-text">
                  Andy
                </p>
              </h1>
            </div>
            <p className="text-headline leading-headline font-semibold max-w-1/2 ">
              Designing intelligent systems for complex problems, shaped by real
              people and lived experiences.
            </p>
          </div>
        </div>
        <ScrollIndicator opacity={heroDecorationOpacity} />
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full py-10 gap-8">
        {casePreviews?.map((casePreview, i) => (
          <div
            key={casePreview.id}
            id={i === 0 ? "work" : undefined}
            className={i === 0 ? "w-full scroll-mt-28" : "w-full"}
          >
            <CaseRow
              key={casePreview.id}
              id={casePreview.id}
              align={i % 2 === 0 ? "left" : "right"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
