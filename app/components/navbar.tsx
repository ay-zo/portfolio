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
 * - On mobile (<lg), the logo is centered and nav links collapse into a
 *   hamburger button with a dropdown overlay.
 *
 * Domain notes:
 * - This is a global layout component and should stay lightweight.
 */

"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";
import Logo from "./logo";
import { useEntryAnimation } from "../context/entry-animation-context";
import { useDownloadResume } from "../hooks/use-download-resume";

export default function Navbar() {
  const { scrollY } = useScroll();
  const { entryComplete } = useEntryAnimation();
  const { downloadResume } = useDownloadResume();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handles the Work nav click with route-aware behavior.
   *
   * Behavior:
   * - On home: always smooth-scrolls to #work (even if hash is unchanged)
   * - Off home: navigates to /#work so Home can perform the same animated scroll
   * - Closes the mobile menu if open
   */
  const handleWorkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMobileMenuOpen(false);

    if (pathname !== "/") {
      router.push("/#work");
      return;
    }

    scrollToWorkSection();
    window.history.replaceState(null, "", "/#work");
  };

  /** Triggers resume download and closes the mobile menu. */
  const handleResumeClick = () => {
    setMobileMenuOpen(false);
    downloadResume();
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-50 overflow-hidden lg:h-20"
      style={{
        backgroundColor: navSurface,
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
      }}
      initial={entryComplete ? { y: 0 } : { y: "-100%" }}
      animate={{
        y: entryComplete ? 0 : "-100%",
        height: mobileMenuOpen ? 160 : "auto",
      }}
      transition={{
        y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="h-16 lg:h-18 flex flex-row justify-center lg:justify-between items-center px-6 lg:px-10 relative">
        <div className="flex items-center text-white font-sans">
          <Link
            href="/"
            onClick={scrollToTop}
            className="uppercase font-light tracking-wider text-title flex flex-row items-center gap-4"
          >
            <Logo />
            Andy Zhuo
          </Link>
        </div>

        <div className="hidden lg:flex justify-end items-center gap-8 font-sans">
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

        <button
          type="button"
          className="lg:hidden absolute right-6 top-1/2 -translate-y-1/2 p-2 text-secondary hover:text-primary transition-colors duration-200"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden flex flex-col items-center gap-6 px-6 pb-6 pt-2 font-sans"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
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
              onClick={handleResumeClick}
              className={navActionClass}
            >
              Resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
