"use client";

export interface CasePreview {
  id: string;
  title: string;
  tags: string[];
  caseSummary: string;
  impact: string[];
  status: "confidential" | "public";
  year: string;
}
