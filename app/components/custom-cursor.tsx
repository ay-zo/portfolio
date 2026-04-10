"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";

export default function AuroraCursor() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'button, a, [role="button"], input, textarea, select, summary, label, [data-cursor-ring="true"]',
      );

      setIsHoveringInteractive(Boolean(interactive));
    };

    const handleLeave = () => {
      setIsVisible(false);
      setIsHoveringInteractive(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  const coreBlob = [
    "44% 56% 52% 48% / 46% 42% 58% 54%",
    "58% 42% 47% 53% / 39% 61% 39% 61%",
    "49% 51% 60% 40% / 55% 38% 62% 45%",
    "61% 39% 43% 57% / 53% 57% 43% 47%",
    "44% 56% 52% 48% / 46% 42% 58% 54%",
  ];

  const cursorX = useSpring(mouseX, { stiffness: 700, damping: 45 });
  const cursorY = useSpring(mouseY, { stiffness: 700, damping: 45 });

  const trailX = useSpring(mouseX, { stiffness: 180, damping: 28 });
  const trailY = useSpring(mouseY, { stiffness: 180, damping: 28 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
        className="pointer-events-none fixed left-0 top-0 z-[9998] transition-opacity duration-300 mix-blend-color-dodge"
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-[9999] blur-lg"
          style={{
            background:
              "radial-gradient(circle, oklch(from var(--color-brand-primary) l c h / 0.42) 0%, oklch(from var(--color-brand-secondary) l c h / 0.26) 38%, oklch(from var(--color-brand-primary) l c h / 0.10) 62%, oklch(from var(--color-brand-secondary) l c h / 0) 78%)",
          }}
          animate={{
            scale: [0.42, 1.2, 0.42],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] transition-opacity duration-200"
      >
        <div className="-translate-x-1/2 -translate-y-1/2 relative h-5 w-5 backdrop-blur-xs rounded-[9999] shadow-md">
          <motion.svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible "
            width="34"
            height="34"
            viewBox="0 0 34 34"
            initial={false}
            animate={{
              opacity: isHoveringInteractive ? 1 : 0,
              scale: isHoveringInteractive ? 1 : 0.9,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            <motion.circle
              cx="17"
              cy="17"
              r="20"
              fill="oklch(from var(--color-brand-primary) l c h / 0.1)"
              stroke="oklch(from var(--color-brand-primary) l c h / 0.95)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={false}
              animate={{
                pathLength: isHoveringInteractive ? 1 : 0,
              }}
              transition={{
                duration: 0.35,
                ease: "easeInOut",
              }}
              style={{
                filter:
                  "drop-shadow(0 0 4px oklch(from var(--color-brand-primary) l c h / 0.65)) drop-shadow(0 0 10px oklch(from var(--color-brand-secondary) l c h / 0.35))",
                rotate: -90,
                transformOrigin: "50% 50%",
              }}
            />
          </motion.svg>
          {/* Outer glow (aurora) */}
          <div
            className="absolute inset-0 rounded-[9999] blur-lg"
            style={{
              background:
                "radial-gradient(circle, oklch(from var(--color-brand-primary) l c h / 0.4) 0%, transparent 70%)",
            }}
          />

          {/* Core translucent fill */}
          <div
            className="absolute inset-0 rounded-[9999]"
            style={{
              background: "oklch(from var(--color-brand-primary) l c h / 0.2)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Top highlight (glass reflection) */}
          <div
            className="absolute inset-0 rounded-[9999]"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, oklch(from var(--color-brand-primary) l c h / 0.15), transparent 60%)",
              mixBlendMode: "overlay",
            }}
          />

          {/* Subtle edge definition */}
          <motion.div
            className="absolute inset-0 rounded-[9999]"
            animate={{
              boxShadow: isHoveringInteractive
                ? "inset 0 0 10px oklch(from var(--color-brand-primary) l c h / 0.95), 0 0 12px oklch(from var(--color-brand-primary) l c h / 0.45)"
                : "inset 0 0 6px oklch(from var(--color-brand-primary) l c h / 0.8), 0 0 4px oklch(from var(--color-brand-primary) l c h / 0.25)",
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          />
        </div>
      </motion.div>
    </>
  );
}
