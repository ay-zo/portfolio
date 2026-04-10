/**
 * HomePage
 *
 * Purpose:
 * Landing page that displays a fullscreen 3D Spline scene as an immersive
 * background with an aurora-style radial gradient overlay. Orchestrates a
 * loading screen → entry animation sequence on initial visit.
 *
 * Responsibilities:
 * - Show a loading screen for ~3 seconds on initial page load
 * - Compose the SplineScene 3D component
 * - Render the atmospheric gradient backdrop using brand palette tokens
 * - Stagger hero text reveals (typewriter), SplineScene fade-in, aurora
 *   gradient fade-in, and scroll indicator appearance
 *
 * Data sources:
 * - useCasePreviews — case study preview data for CaseRow components
 * - EntryAnimationContext — coordinates entry state with Navbar
 *
 * UX notes:
 * - The gradient is rendered as a decorative pseudo-layer behind the scene,
 *   blurred and scaled to create a soft aurora halo effect
 * - Hero-only decorative layers fade away as users scroll into work samples
 * - Entry animations play once per hard page load and are not replayed on
 *   client-side navigations back to the home page
 *
 * Domain notes:
 * - Brand colors (--color-brand-primary, --color-brand-secondary) drive the
 *   gradient stops via oklch relative color syntax for tonal control
 */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import SplineScene from "./components/SplineScene";
import CaseRow from "./components/case-study/case-row";
import { useCasePreviews } from "./hooks/use-case-previews";
import ScrollIndicator from "./components/scroll-indicator";
import LoadingScreen from "./components/loading-screen";
import TypewriterText from "./components/typewriter-text";
import { useEntryAnimation } from "./context/entry-animation-context";
import Footer from "./components/footer";

/**
 * Stagger delays (in seconds from the moment loading completes).
 * These control the cascade order of hero-section entry animations.
 */
const TIMING = {
  splineFadeIn: 0,
  auroraFadeIn: 0.15,
  heroLine1Delay: 0.2,
  heroLine1Speed: 0.04,
  heroLine2Offset: 0.15,
  labelFadeDelay: 0.15,
  scrollIndicatorDelay: 0.4,
};

const HERO_LINE1_TEXT = "Hey, I'm Andy";
const HERO_NAME = "Andy";
const HERO_LINE2_TEXT =
  "I design intelligent systems for complex problems, letting curiosity guide me into unfamiliar spaces";

/**
 * Renders the landing page.
 *
 * Behavior:
 * - Mounts the loading screen overlay on initial visit
 * - After loading completes, signals the EntryAnimationContext so the Navbar
 *   slides in, and begins the hero entry animation cascade
 * - Overlays a blurred multi-layer radial gradient anchored to the bottom-right
 * - Applies a shared scroll-driven fade to hero-only decorative elements
 *
 * Keep this component focused on:
 * - page-level composition
 * - animation orchestration
 * - visual atmosphere
 *
 * Avoid placing interaction or data-fetching logic here.
 */
export default function Home() {
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(1);
  const { entryComplete, completeEntry } = useEntryAnimation();
  const hasHandledHashScroll = useRef(false);

  /**
   * Phases track which hero elements have completed their animations so
   * downstream elements can begin on cue.
   */
  const [heroLine1Done, setHeroLine1Done] = useState(false);
  const [heroLine2Done, setHeroLine2Done] = useState(false);
  const [labelDone, setLabelDone] = useState(false);

  const { data: casePreviews } = useCasePreviews();

  useEffect(() => {
    const syncViewportHeight = () => {
      setViewportHeight(window.innerHeight || 1);
    };

    syncViewportHeight();
    window.addEventListener("resize", syncViewportHeight);

    return () => window.removeEventListener("resize", syncViewportHeight);
  }, []);

  useEffect(() => {
    /**
     * Preserves smooth scroll behavior for direct /#work navigations.
     *
     * Why:
     * When users arrive from another route, this page should match the same
     * smooth motion used by in-page "Preview my work" and navbar clicks.
     */
    if (hasHandledHashScroll.current) return;
    if (!entryComplete) return;
    if (window.location.hash !== "#work") return;

    const workSection = document.getElementById("work");
    if (!workSection) return;

    hasHandledHashScroll.current = true;
    requestAnimationFrame(() => {
      workSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [entryComplete, casePreviews]);

  const heroDecorationOpacity = useTransform(scrollY, (currentScrollY) => {
    const progress = Math.min(Math.max(currentScrollY / viewportHeight, 0), 1);
    return (1 - progress) * (1 - progress);
  });

  const handleLoadingComplete = useCallback(() => {
    completeEntry();
  }, [completeEntry]);

  /** Whether the hero cascade has reached a point where all visuals are in */
  const allAnimationsDone = entryComplete && labelDone;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-x-hidden">
      {/* Loading screen — only rendered on initial visit before entry completes */}
      {!entryComplete && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/*
       * Aurora gradient backdrop — two nested layers:
       * Outer: entry fade-in controlled by framer-motion animate
       * Inner: scroll-driven fade controlled by heroDecorationOpacity MotionValue
       * Nesting avoids the animate vs style.opacity conflict in framer-motion.
       * The .aurora-gradient CSS class handles desktop vs mobile positioning
       * (bottom-right on desktop, centered on mobile).
       */}
      <motion.div
        className="pointer-events-none absolute top-[-20%] bottom-[-20%] left-1/2 -translate-x-1/2 w-screen max-w-screen mb-20 -z-10"
        initial={{ opacity: 0 }}
        animate={entryComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{
          duration: 1.2,
          delay: TIMING.auroraFadeIn,
          ease: "easeOut",
        }}
      >
        <motion.div
          className="w-full h-full aurora-gradient"
          style={{ opacity: heroDecorationOpacity }}
        />
      </motion.div>

      <div className="relative flex min-h-screen max-h-screen w-full items-center justify-center overflow-hidden font-sans">
        {/* SplineScene — fades in after loading completes; hidden on mobile */}
        <motion.div
          className="absolute inset-0 hidden lg:block"
          initial={{ opacity: 0 }}
          animate={entryComplete ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 1.4,
            delay: TIMING.splineFadeIn,
            ease: "easeOut",
          }}
        >
          <SplineScene />
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-full flex">
          <div className="flex flex-col justify-center items-start w-full px-10 lg:px-36 gap-4 lg:gap-6">
            {/* Label line — simple opacity fade after typewriter lines finish */}
            <div className="flex flex-col items-start justify-center">
              <motion.p
                className="font-label text-label-lg uppercase font-medium text-brand-primary-muted leading-label"
                initial={{ opacity: 0 }}
                animate={heroLine2Done ? { opacity: 1 } : { opacity: 0 }}
                transition={{
                  duration: 0.6,
                  delay: TIMING.labelFadeDelay,
                  ease: "easeOut",
                }}
                onAnimationComplete={() => {
                  if (heroLine2Done) setLabelDone(true);
                }}
              >
                UX Designer // Currently building @ BCG X
              </motion.p>

              {/* "Hey, I'm Andy" — typewriter reveal, first in the cascade */}
              <h1 className="text-hero font-semibold text-white flex flex-row items-center gap-4 leading-hero">
                {entryComplete && (
                  <TypewriterText
                    text={HERO_LINE1_TEXT}
                    delay={TIMING.heroLine1Delay}
                    speed={TIMING.heroLine1Speed}
                    highlightRange={{
                      start: HERO_LINE1_TEXT.length - HERO_NAME.length,
                      end: HERO_LINE1_TEXT.length,
                    }}
                    highlightClassName="bg-gradient-to-r from-brand-secondary to-brand-primary-muted bg-clip-text text-transparent"
                    onComplete={() => setHeroLine1Done(true)}
                  />
                )}
              </h1>
            </div>

            {/*
             * Headline slot keeps a stable block height from first paint.
             *
             * Why:
             * The first hero line should animate from its final resting position.
             * Reserving this space prevents the centered stack from shifting upward
             * when line 2 mounts and begins typing.
             */}
            <div className="relative max-w-full lg:max-w-1/2">
              <p
                aria-hidden
                className="invisible text-headline leading-headline font-semibold"
              >
                {HERO_LINE2_TEXT}
              </p>
              <p className="absolute inset-0 text-headline leading-headline font-semibold text-secondary">
                {heroLine1Done && (
                  <TypewriterText
                    text={HERO_LINE2_TEXT}
                    delay={TIMING.heroLine2Offset}
                    speed={0.012}
                    onComplete={() => setHeroLine2Done(true)}
                  />
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator — appears last once all hero animations finish */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={allAnimationsDone ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: TIMING.scrollIndicatorDelay,
            ease: "easeOut",
          }}
        >
          <ScrollIndicator opacity={heroDecorationOpacity} />
        </motion.div>
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

      <Footer />
    </div>
  );
}
