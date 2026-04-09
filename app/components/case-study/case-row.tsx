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
 * - Portrait mobile: layout stacks vertically — mockup on top (1/3 height),
 *   description below (2/3 height), both full width.
 * - Landscape mobile: keeps the side-by-side layout with adjusted font sizes.
 *
 * Domain notes:
 * - Alignment alternates per row index to create visual rhythm across the
 *   case study section.
 */

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/app/lib/utils";
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
 * - On portrait mobile, both children stack vertically via CSS order so
 *   mockup always appears on top regardless of the `align` prop.
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
    tags: casePreview?.tags || [],
    year: casePreview?.year || "",
    caseTitle: casePreview?.title || "",
    caseSummary: casePreview?.caseSummary || "",
    impact: casePreview?.impact || [],
    status: (casePreview?.status || "confidential") as
      | "confidential"
      | "public",
    textX: descriptionTextX,
  };

  return (
    <motion.div
      ref={rowRef}
      className="w-full h-[calc(100vh-8rem)] flex flex-row portrait:max-lg:flex-col gap-6 portrait:max-lg:gap-4 px-6"
      style={{ opacity: rowOpacity }}
    >
      {/* Mockup — always on top in portrait mobile via CSS order */}
      <motion.div
        className={cn(
          "w-2/3 h-full",
          "portrait:max-lg:w-full portrait:max-lg:h-1/3",
          align === "left" ? "order-2 portrait:max-lg:order-1" : "order-1",
        )}
        style={{ x: mockupX }}
      >
        <Mockup className="w-full h-full" id={id} align={align} />
      </motion.div>

      {/* Description card — always below mockup in portrait mobile */}
      <motion.div
        className={cn(
          "w-1/3 h-full",
          "portrait:max-lg:w-full portrait:max-lg:h-2/3",
          align === "left" ? "order-1 portrait:max-lg:order-2" : "order-2",
        )}
        style={{ x: descriptionX }}
      >
        <DescriptionCard {...descriptionCardProps} className="w-full h-full" />
      </motion.div>
    </motion.div>
  );
}
