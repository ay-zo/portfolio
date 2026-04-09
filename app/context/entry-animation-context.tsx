/**
 * EntryAnimationContext
 *
 * Purpose:
 * Coordinates the initial page-load animation sequence across layout-level
 * components (e.g. Navbar) and page-level orchestration (loading screen, hero).
 *
 * Used by:
 * - Navbar (slide-in after entry completes)
 * - Home page (signals entry completion after loading screen)
 *
 * Notes:
 * - State initializes based on the current pathname so only the home page
 *   starts with a pending entry animation; all other routes render immediately.
 * - State persists across client-side navigations so the loading screen only
 *   plays once per hard page load.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface EntryAnimationContextValue {
  /** Whether the loading/entry sequence has finished */
  entryComplete: boolean;
  /** Signal that the entry animation has completed */
  completeEntry: () => void;
}

const EntryAnimationContext = createContext<EntryAnimationContextValue>({
  entryComplete: true,
  completeEntry: () => {},
});

export function EntryAnimationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /**
   * Only the home page (`/`) starts with a pending entry animation.
   * The lazy initializer runs once, so subsequent navigations within the same
   * session won't re-trigger the loading screen.
   */
  const [entryComplete, setEntryComplete] = useState(() => pathname !== "/");

  const completeEntry = useCallback(() => {
    setEntryComplete(true);
  }, []);

  return (
    <EntryAnimationContext.Provider value={{ entryComplete, completeEntry }}>
      {children}
    </EntryAnimationContext.Provider>
  );
}

export function useEntryAnimation() {
  return useContext(EntryAnimationContext);
}
