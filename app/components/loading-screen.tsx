/**
 * LoadingScreen
 *
 * Purpose:
 * Full-screen overlay that plays during the initial page load, giving the 3D
 * scene and assets time to hydrate while showing an animated brand logo.
 *
 * Shows:
 * - Animated logo cycling through three states (0 → 1 → 2 → 0 …)
 * - "Loading portfolio" label with a pulsing opacity
 *
 * UX notes:
 * - The logo animation progressively adds parallelogram "dot" shapes so the
 *   user perceives incremental progress.
 * - After the specified duration the overlay fades out and fires `onComplete`
 *   so downstream animations can begin.
 *
 * Domain notes:
 * - Logo states correspond to public/image/logo_state={0,1,2}.svg; the two
 *   extra paths (dot1, dot2) are the only differences between states.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Total time the loading screen is displayed before fading out (ms) */
const LOADING_DURATION_MS = 2100;

/** Duration for the logo state cycle animation (seconds) */
const CYCLE_DURATION = 1.2;

/** Duration for the final fade-out of the overlay (seconds) */
const FADE_OUT_DURATION = 0.6;

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Renders the full-screen loading overlay with animated logo.
 *
 * Behavior:
 * - Mounts with full opacity covering the viewport at z-[100]
 * - Cycles the logo through three states in a continuous loop
 * - After LOADING_DURATION_MS, triggers exit animation and calls onComplete
 *
 * Fallback behavior:
 * - If unmounted early the timer is cleaned up safely
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const previousOverflowRef = useRef<{ body: string; root: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, LOADING_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    /**
     * Locks document scrolling while the loading overlay is visible.
     *
     * Why:
     * Prevents users from scrolling the underlying page before entry animation
     * state is ready, which can desynchronize first-paint motion behavior.
     */
    const body = document.body;
    const root = document.documentElement;
    if (!previousOverflowRef.current) {
      previousOverflowRef.current = {
        body: body.style.overflow,
        root: root.style.overflow,
      };
    }

    if (visible) {
      body.style.overflow = "hidden";
      root.style.overflow = "hidden";
    } else {
      body.style.overflow = previousOverflowRef.current.body;
      root.style.overflow = previousOverflowRef.current.root;
    }

    return () => {
      if (!previousOverflowRef.current) return;
      body.style.overflow = previousOverflowRef.current.body;
      root.style.overflow = previousOverflowRef.current.root;
    };
  }, [visible]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background gap-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_DURATION, ease: "easeInOut" }}
        >
          <AnimatedLogo />

          <motion.p
            className="font-label text-label-lg uppercase tracking-wider text-secondary"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading portfolio
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline SVG logo that smoothly cycles through three states by toggling the
 * opacity of two parallelogram "dot" paths.
 *
 * Why:
 * Using an inline SVG with motion paths avoids image-swap flicker and enables
 * sub-element animation that isn't possible with <img> tags.
 */
function AnimatedLogo() {
  return (
    <svg
      width="84"
      height="112"
      viewBox="0 0 21 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base logo paths — always visible (shared across all three states) */}
      <path
        d="M2.74704 11.7464L2.74624 11.7481H0.804248L4.56009 3.89806L4.35045 3.15967L0 12.2523H1.94199L1.9428 12.2506H6.91332L6.77365 11.7464H2.74704Z"
        fill="currentColor"
      />
      <path
        d="M4.52363 10.6277L4.52283 10.6294H2.5811L5.01851 5.53464L4.80405 4.77832L1.77686 11.1336H3.71858L3.71938 11.1319H6.59913L6.45946 10.6277H4.52363Z"
        fill="currentColor"
      />
      <path
        d="M15.7874 10.6227V10.6216H14.9183L14.9174 10.6233H9.94666L10.0863 11.1272H14.1336L14.1344 11.1255H15.0032V11.1266H20.2161L12.328 27.9922H12.8763L21 10.6227H15.7874Z"
        fill="currentColor"
      />
      <path
        d="M14.0778 11.7443V11.7432H13.2087L13.2079 11.7448H10.2748L10.4145 12.2488H12.424L12.4248 12.2471H13.2939V12.2479H18.5068L11.1576 28.0001H11.6937L19.2907 11.7443H14.0778Z"
        fill="currentColor"
      />
      <path
        d="M5.33512 1.42334L5.0094 2.11691L11.4967 25.1784L11.8147 24.5017L5.33512 1.42334Z"
        fill="currentColor"
      />
      <path
        d="M6.0037 0L5.67798 0.693571L12.1656 23.7551L12.4833 23.0783L6.0037 0Z"
        fill="currentColor"
      />

      {/*
       * Dot 1 — appears in states 1 and 2.
       * Fades in at ~30% of the cycle, stays visible, fades out at ~90%.
       */}
      <motion.path
        d="M17.0412 25.2549L15.7683 27.9829H16.3045L17.5795 25.2549H17.0412Z"
        fill="currentColor"
        animate={{ opacity: [0, 0, 1, 1, 1, 0] }}
        transition={{
          duration: CYCLE_DURATION,
          times: [0, 0.28, 0.35, 0.6, 0.88, 0.95],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/*
       * Dot 2 — appears only in state 2.
       * Fades in at ~60% of the cycle, then fades out with dot 1 at ~90%.
       */}
      <motion.path
        d="M20.4363 25.2549L19.1639 27.9751H19.7122L20.9845 25.2549H20.4363Z"
        fill="currentColor"
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{
          duration: CYCLE_DURATION,
          times: [0, 0.55, 0.63, 0.7, 0.88, 0.95],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}
