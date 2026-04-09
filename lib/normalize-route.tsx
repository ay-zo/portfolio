// components/normalize-route.tsx
"use client";

import { useEffect } from "react";

export default function NormalizeRoute() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      const cleanUrl = window.location.pathname + window.location.search;

      window.history.replaceState(null, "", cleanUrl);

      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
