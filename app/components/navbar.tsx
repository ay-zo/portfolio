"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Logo from "./logo";

/**
 * Navbar
 *
 * Purpose:
 * Primary global navigation that keeps brand identity and route links visible
 * while users scroll through the landing page and case-study rows.
 *
 * Shows:
 * - Brand link back to home
 * - Top-level navigation links
 *
 * Data dependencies:
 * - None; static route definitions
 *
 * UX notes:
 * - The nav surface fades in only after scroll starts so hero content remains
 *   visually unobstructed on first paint.
 *
 * Domain notes:
 * - This is a global layout component and should stay lightweight.
 */
export default function Navbar() {
  const { scrollY } = useScroll();
  const scrollPresence = useTransform(scrollY, [0, 48], [0, 1], {
    clamp: true,
  });
  const navSurfaceAlpha = useTransform(scrollPresence, [0, 1], [0, 0.6]);
  const navSurface = useMotionTemplate`oklch(from var(--color-surface-1) l c h / ${navSurfaceAlpha})`;
  const navBlur = useTransform(
    scrollPresence,
    [0, 1],
    ["blur(0px)", "blur(16px)"],
  );

  const navItems = [
    {
      label: "Work",
      href: "/#work",
    },
    // {
    //   label: "About",
    //   href: "/about",
    // },
    {
      label: "Resume",
      href: "/resume",
    },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full h-20 z-50 flex flex-row justify-between items-center px-10 transition-all duration-800"
      style={{
        backgroundColor: navSurface,
        backdropFilter: navBlur,
      }}
    >
      <div className="flex justify-between items-center text-white font-sans">
        <Link
          href="/"
          className="uppercase font-light tracking-wider text-title flex flex-row items-center gap-4"
        >
          <Logo />
          Andy Zhuo
        </Link>
      </div>
      <div className="flex justify-end items-center gap-8 font-sans">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-title uppercase tracking-wide text-secondary"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
