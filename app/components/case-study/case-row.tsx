/**
 * CaseRow
 *
 * Purpose:
 * Composes a single case-study preview row containing a mockup and a
 * description card, arranged in an alternating left/right layout.
 *
 * Shows:
 * - Mockup image with gradient background
 * - Description card with tags, title, summary, impact metrics, and CTA
 *
 * Data dependencies:
 * - useCasePreview (fetches individual case study preview data)
 *
 * UX notes:
 * - Mockup and description card slide in from opposite sides of the viewport
 *   as the user scrolls the row into view. The mockup covers more distance
 *   because it is wider, keeping the motion proportional.
 * - Scrolling back up reverses the animation for a natural feel.
 *
 * Domain notes:
 * - Alignment alternates per row index to create visual rhythm across the
 *   case study section.
 */

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import DescriptionCard from "./description-card";
import Mockup from "./mockup";
import { useCasePreview } from "../../hooks/use-case-previews";

interface CaseRowProps {
  id: string;
  align: "left" | "right";
}

/**
 * Renders a case-study row with scroll-driven slide-in animations.
 *
 * Behavior:
 * - Uses a scroll-progress range tied to the row's ref element
 * - Maps progress [0→1] to translateX offsets that bring the mockup and
 *   description card into their final layout positions
 * - Mockup travels further (wider element) than the description card so
 *   perceived speed stays balanced
 *
 * Fallback behavior:
 * - Renders nothing visible until data loads (empty strings / arrays)
 */
export default function CaseRow({ id, align }: CaseRowProps) {
  const { data: casePreview } = useCasePreview(id);
  const rowRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    /**
     * "start end" = animation begins when the row's top edge hits the viewport bottom.
     * "start 0.6" = animation completes when the row's top edge reaches ~60% viewport height.
     * This front-loads horizontal movement so mockup and card are connected by
     * the time the full row is in comfortable reading view.
     */
    offset: ["start end", "start 0.6"],
  });

  const mockupX = useTransform(
    scrollYProgress,
    [0, 1],
    align === "left" ? ["30%", "0%"] : ["-30%", "0%"],
  );
  const descriptionX = useTransform(
    scrollYProgress,
    [0, 1],
    align === "left" ? ["-18%", "0%"] : ["18%", "0%"],
  );
  const descriptionTextX = useTransform(
    scrollYProgress,
    [0, 1],
    align === "left" ? ["-18%", "0%"] : ["18%", "0%"],
  );
  const rowOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  const descriptionCardProps = {
    className: "w-1/3",
    tags: casePreview?.tags || [],
    year: casePreview?.year || "",
    caseTitle: casePreview?.title || "",
    caseSummary: casePreview?.caseSummary || "",
    impact: casePreview?.impact || [],
    status: (casePreview?.status || "confidential") as "confidential" | "public",
    textX: descriptionTextX,
  };

  return (
    <motion.div
      ref={rowRef}
      className="w-full h-[calc(100vh-8rem)] flex flex-row gap-6 px-6"
      style={{ opacity: rowOpacity }}
    >
      {align === "left" ? (
        <>
          <motion.div className="w-1/3 h-full" style={{ x: descriptionX }}>
            <DescriptionCard {...descriptionCardProps} className="w-full h-full" />
          </motion.div>
          <motion.div className="w-2/3 h-full" style={{ x: mockupX }}>
            <Mockup className="w-full h-full" id={id} align={align} />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div className="w-2/3 h-full" style={{ x: mockupX }}>
            <Mockup className="w-full h-full" id={id} align={align} />
          </motion.div>
          <motion.div className="w-1/3 h-full" style={{ x: descriptionX }}>
            <DescriptionCard {...descriptionCardProps} className="w-full h-full" />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
