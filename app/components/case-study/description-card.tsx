/**
 * DescriptionCard
 *
 * Purpose:
 * Displays the textual summary for a case-study row, including context tags,
 * title, summary, impact metrics, and the primary case-study action.
 *
 * Shows:
 * - Case metadata tags and year
 * - Case title and concise summary
 * - Impact metrics split into value/label pairs
 * - CTA with confidentiality-aware label
 *
 * UX notes:
 * - Text blocks can receive the same scroll-linked motion used by the parent
 *   row so content reveal timing stays synchronized with card movement.
 * - The card uses a translucent surface to preserve contrast over artwork.
 */

"use client";

import { cn } from "@/app/lib/utils";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
import CaseButton from "./case-button";

interface DescriptionCardProps {
  tags: string[];
  year: string;
  caseTitle: string;
  caseSummary: string;
  impact: string[];
  status: "confidential" | "public";
  className?: string;
  textX?: MotionValue<string>;
}

/**
 * Renders the case-study description content block.
 *
 * Behavior:
 * - Maps impact strings into value + label rows
 * - Applies optional scroll-driven text translation and opacity
 * - Adjusts CTA label based on confidentiality status
 *
 * Fallback behavior:
 * - Accepts empty arrays/strings while preview data is loading
 */
export default function DescriptionCard({
  tags,
  year,
  caseTitle,
  caseSummary,
  impact,
  status,
  className,
  textX,
}: DescriptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: visibilityProgress } = useScroll({
    target: cardRef,
    /**
     * Visibility progress:
     * - 0 when the card top first touches viewport bottom (just entered)
     * - 1 when the card top reaches viewport top
     */
    offset: ["start end", "start start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /**
   * Maps card visibility progress to staged text reveals.
   *
   * Why:
   * Text should begin only after at least one-third of the card is visible.
   * Each subsequent block then cascades in before full alignment.
   */
  const metaOpacity = useTransform(
    visibilityProgress,
    isMobile ? [0.15, 0.28] : [0.33, 0.52],
    [0, 1],
  );

  const titleOpacity = useTransform(
    visibilityProgress,
    isMobile ? [0.2, 0.34] : [0.42, 0.64],
    [0, 1],
  );

  const impactOpacity = useTransform(
    visibilityProgress,
    isMobile ? [0.26, 0.4] : [0.52, 0.76],
    [0, 1],
  );

  const ctaOpacity = useTransform(
    visibilityProgress,
    isMobile ? [0.32, 0.46] : [0.62, 0.86],
    [0, 1],
  );
  const metaMotionStyles = { x: textX, opacity: metaOpacity };
  const titleMotionStyles = { x: textX, opacity: titleOpacity };
  const impactMotionStyles = { x: textX, opacity: impactOpacity };
  const ctaMotionStyles = { x: textX, opacity: ctaOpacity };

  return (
    <div
      ref={cardRef}
      className={cn(
        "h-full flex flex-col justify-between bg-surface-1/80 border border-stroke rounded-3xl corner-smoothing-[0.6]",
        "px-6 py-16 lg:px-12 lg:pt-36 lg:pb-12",
        "shadow-lg",
        className || "",
      )}
    >
      <div className="flex flex-col gap-4 lg:gap-8">
        <motion.div
          className="flex flex-row items-center gap-2 text-secondary uppercase text-label-lg lg:text-label-sm font-medium font-label w-full"
          style={metaMotionStyles}
        >
          <div className="flex flex-row items-center">
            {tags.map((tag, index) => (
              <div className="flex flex-row items-center gap-0" key={index}>
                {tag}
                {index < tags.length - 1 && <p className="mx-1"> / </p>}
              </div>
            ))}
          </div>
          <div className="w-1 h-1 rounded-[9999] bg-current" />
          <p>{year}</p>
        </motion.div>
        <motion.div
          className="flex flex-col gap-2 lg:gap-4 max-w-full lg:max-w-[85%]"
          style={titleMotionStyles}
        >
          <h2 className="text-headline font-semibold uppercase leading-headline">
            {caseTitle}
          </h2>
          <p className="text-title font-title leading-title text-secondary">
            {caseSummary}
          </p>
        </motion.div>
      </div>
      <motion.div className="flex gap-10" style={impactMotionStyles}>
        {impact.map((item, i) => {
          const [value, ...rest] = item.split(" ");
          const label = rest.join(" ");
          return (
            <div key={i} className="flex flex-col">
              <p className="text-3xl lg:text-headline font-semibold leading-3xllg:leading-headline text-secondary">
                {value}
              </p>
              <p className="text-label-lg lg:text-label-sm text-muted uppercase">
                {label}
              </p>
            </div>
          );
        })}
      </motion.div>
      <motion.div
        className="flex flex-row w-full justify-center"
        style={ctaMotionStyles}
      >
        <CaseButton
          label={status === "confidential" ? "Contact me" : "View Case Study"}
          href="/case-studies/flight-ops"
          status={status}
        />
      </motion.div>
    </div>
  );
}
