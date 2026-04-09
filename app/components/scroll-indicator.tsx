"use client";

import { motion, type MotionValue } from "framer-motion";
import { ChevronDown } from "lucide-react";

type ScrollIndicatorProps = {
  opacity: MotionValue<number>;
};

export default function ScrollIndicator({ opacity }: ScrollIndicatorProps) {
  const handleClick = () => {
    document.getElementById("work")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <motion.button
      type="button"
      className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center cursor-pointer transition-all duration-300 text-secondary hover:text-primary"
      style={{ opacity }}
      aria-label="Scroll to work"
      onClick={handleClick}
    >
      <p className="text-label-lg uppercase tracking-wide">Preview my work</p>

      <div className="flex flex-col items-center justify-center -space-y-2.5">
        <motion.div
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{
            duration: 1.4,
            times: [0, 0.2, 0.45, 0.75, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>

        <motion.div
          animate={{ opacity: [0, 0, 0, 1, 0] }}
          transition={{
            duration: 1.4,
            times: [0, 0.45, 0.6, 0.75, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>
    </motion.button>
  );
}
