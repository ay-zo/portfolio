"use client";

import { useCallback } from "react";

/**
 * useDownloadResume
 *
 * Purpose:
 * Provides a client-only resume download action so the navbar can avoid
 * server/client attribute mismatches from SSR-rendered download links.
 *
 * Responsibilities:
 * - Expose a stable click handler for downloading the resume PDF
 * - Keep download behavior in one place for future tracking/analytics
 *
 * Source of truth:
 * - `/public/docs/Andy_Zhuo_resume.pdf`
 *
 * Notes:
 * - Uses a temporary `<a>` element to preserve native browser download behavior.
 */
export function useDownloadResume() {
  /**
   * Triggers browser-native download of the portfolio resume.
   *
   * Why:
   * This keeps download-only behavior on the client and avoids hydration drift
   * from mixed SSR anchor/link attributes.
   */
  const downloadResume = useCallback(() => {
    const link = document.createElement("a");
    link.href = "/docs/Andy_Zhuo_resume.pdf";
    link.download = "Andy_Zhuo_resume.pdf";
    link.rel = "noopener";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { downloadResume };
}
