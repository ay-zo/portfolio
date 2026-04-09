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
 * - EntryAnimationContext (controls initial slide-in on home page)
 *
 * UX notes:
 * - The nav surface fades in only after scroll starts so hero content remains
 *   visually unobstructed on first paint.
 * - On the home page, the navbar slides in from above after the loading
 *   screen completes to create a polished entry sequence.
 *
 * Domain notes:
 * - This is a global layout component and should stay lightweight.
 */

"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent } from "react";
import Logo from "./logo";
import { useEntryAnimation } from "../context/entry-animation-context";
import { useDownloadResume } from "../hooks/use-download-resume";

export default function Navbar() {
  const { scrollY } = useScroll();
  const { entryComplete } = useEntryAnimation();
  const { downloadResume } = useDownloadResume();
  const pathname = usePathname();
  const router = useRouter();

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
  ];

  const navActionClass =
    "relative group text-title uppercase tracking-wide text-secondary hover:text-primary transition-all duration-300 cursor-pointer " +
    "after:absolute after:left-0 after:-bottom-[8px] after:h-[2px] after:w-full " +
    "after:origin-left after:scale-x-0 after:bg-brand-primary " +
    "after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

  /**
   * Smoothly scrolls to the work section on the home page.
   *
   * Why:
   * Route hash-only navigation does not re-trigger once the URL already
   * contains `#work`, so this imperative scroll keeps every click actionable.
   */
  const scrollToWorkSection = () => {
    document.getElementById("work")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * Handles the Work nav click with route-aware behavior.
   *
   * Behavior:
   * - On home: always smooth-scrolls to #work (even if hash is unchanged)
   * - Off home: navigates to /#work so Home can perform the same animated scroll
   */
  const handleWorkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (pathname !== "/") {
      router.push("/#work");
      return;
    }

    scrollToWorkSection();
    window.history.replaceState(null, "", "/#work");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full h-20 z-50 flex flex-row justify-between items-center px-10 transition-all duration-800"
      style={{
        backgroundColor: navSurface,
        backdropFilter: navBlur,
      }}
      initial={entryComplete ? { y: 0 } : { y: "-100%" }}
      animate={entryComplete ? { y: 0 } : { y: "-100%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
            prefetch={false}
            onClick={item.label === "Work" ? handleWorkClick : undefined}
            className={navActionClass}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={downloadResume}
          className={navActionClass}
        >
          Resume
        </button>
      </div>
    </motion.nav>
  );
}
