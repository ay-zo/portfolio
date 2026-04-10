"use client";

import { motion } from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { cn } from "@/app/lib/utils";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  children?: ReactNode;
  onComplete?: () => void;
  highlightRange?: { start: number; end: number };
  highlightClassName?: string;
}

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
  useEffect(() => {
    if (!onComplete) return;

    const characterCount = text.length;
    const finalCharacterDelay = Math.max(characterCount - 1, 0) * speed;
    const characterDuration = 0.3;
    const totalDurationMs =
      (delay + finalCharacterDelay + characterDuration) * 1000;

    const timer = window.setTimeout(() => {
      onComplete();
    }, totalDurationMs);

    return () => window.clearTimeout(timer);
  }, [delay, onComplete, speed, text]);

  const start = highlightRange?.start ?? -1;
  const end = highlightRange?.end ?? -1;

  const beforeHighlight = highlightRange ? text.slice(0, start) : text;
  const highlightedText = highlightRange ? text.slice(start, end) : "";
  const afterHighlight = highlightRange ? text.slice(end) : "";

  let globalIndex = 0;

  const renderChars = (segmentText: string, keyPrefix: string) => {
    const segments = segmentText.split(/(\s+)/).filter(Boolean);

    return segments.map((segment, segmentIndex) => {
      const isWhitespace = /^\s+$/.test(segment);

      if (isWhitespace) {
        return segment.split("").map((char) => {
          const currentIndex = globalIndex++;
          return (
            <motion.span
              key={`${keyPrefix}-space-${segmentIndex}-${currentIndex}`}
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
        <span
          key={`${keyPrefix}-word-${segmentIndex}`}
          className="inline-flex whitespace-nowrap"
        >
          {segment.split("").map((char) => {
            const currentIndex = globalIndex++;
            return (
              <motion.span
                key={`${keyPrefix}-char-${segmentIndex}-${currentIndex}`}
                className="inline-block"
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
    });
  };

  return (
    <span className={className}>
      {renderChars(beforeHighlight, "before")}

      {highlightedText && (
        <motion.span
          className={cn(
            "inline-block whitespace-nowrap bg-gradient-to-r bg-clip-text text-transparent",
            highlightClassName ?? "",
          )}
          initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
            delay: delay + globalIndex * speed,
          }}
        >
          {highlightedText}
        </motion.span>
      )}

      {highlightedText &&
        (() => {
          globalIndex += highlightedText.length;
          return null;
        })()}

      {renderChars(afterHighlight, "after")}

      {children}
    </span>
  );
}
