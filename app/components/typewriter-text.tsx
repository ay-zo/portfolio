/**
 * TypewriterText
 *
 * Purpose:
 * Renders a text string with a left-to-right character reveal animation,
 * simulating a smooth typewriter effect using framer-motion stagger.
 *
 * UX notes:
 * - Each character fades in and slides slightly from the left, creating a
 *   fluid left-to-right sweep rather than an abrupt character pop.
 * - Words are rendered in non-breaking wrappers so line wraps occur only at
 *   whitespace boundaries while preserving per-character animation.
 */

"use client";

import { motion } from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { cn } from "@/app/lib/utils";

interface TypewriterTextProps {
  /** Text content to animate character-by-character */
  text: string;
  /** Delay in seconds before the animation starts */
  delay?: number;
  /** Seconds per character for the stagger interval */
  speed?: number;
  /** Optional className applied to the container span */
  className?: string;
  /** Optional children rendered inline after the text (e.g. gradient-styled words) */
  children?: ReactNode;
  /** Callback fired when the full text reveal has completed */
  onComplete?: () => void;
  /** Inclusive start / exclusive end range for highlighted characters */
  highlightRange?: { start: number; end: number };
  /** Class applied to highlighted characters */
  highlightClassName?: string;
}

/**
 * Renders a character-by-character typewriter reveal.
 *
 * Behavior:
 * - Splits `text` into individual characters
 * - Staggers each character's opacity and x-translate animation
 * - Appends any `children` (e.g. a styled word) after the main text
 * - Calls `onComplete` when the stagger sequence finishes
 */
export default function TypewriterText({
  text,
  delay = 0,
  speed = 0.035,
  className,
  children,
  onComplete,
  highlightRange,
  highlightClassName,
}: TypewriterTextProps) {
  /**
   * Splits text into alternating word and whitespace segments.
   *
   * Why:
   * Word segments can be wrapped in `whitespace-nowrap` so responsive line
   * breaks happen only between words, never in the middle of a word.
   */
  const segments = text.split(/(\s+)/).filter((segment) => segment.length > 0);

  /**
   * Checks whether a character index belongs to the highlighted segment.
   *
   * Why:
   * This keeps gradient/emphasis styling aligned with the same staggered
   * timeline instead of splitting text into separate animated components.
   */
  const isInHighlightRange = (index: number) => {
    if (!highlightRange) return false;
    return index >= highlightRange.start && index < highlightRange.end;
  };

  useEffect(() => {
    if (!onComplete) return;

    /**
     * Completion is timing-driven so parent cascades remain deterministic even
     * when text is rendered in nested word wrappers.
     */
    const characterCount = text.length;
    const finalCharacterDelay = Math.max(characterCount - 1, 0) * speed;
    const characterDuration = 0.3;
    const totalDurationMs = (delay + finalCharacterDelay + characterDuration) * 1000;

    const timer = window.setTimeout(() => {
      onComplete();
    }, totalDurationMs);

    return () => window.clearTimeout(timer);
  }, [delay, onComplete, speed, text]);

  let characterIndex = 0;

  return (
    <span className={className}>
      {segments.map((segment, segmentIndex) => {
        const isWhitespaceSegment = /^\s+$/.test(segment);

        if (isWhitespaceSegment) {
          return segment.split("").map((char) => {
            const currentIndex = characterIndex++;
            return (
              <motion.span
                key={`space-${segmentIndex}-${currentIndex}`}
                className="inline-block whitespace-pre"
                initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: delay + currentIndex * speed,
                }}
              >
                {char}
              </motion.span>
            );
          });
        }

        return (
          <span key={`word-${segmentIndex}`} className="inline-flex whitespace-nowrap">
            {segment.split("").map((char) => {
              const currentIndex = characterIndex++;
              return (
                <motion.span
                  key={`char-${segmentIndex}-${currentIndex}`}
                  className={cn(
                    "inline-block",
                    isInHighlightRange(currentIndex) ? (highlightClassName ?? "") : "",
                  )}
                  initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: delay + currentIndex * speed,
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
      })}
      {children}
    </span>
  );
}
