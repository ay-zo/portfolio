"use client";

import { useQuery } from "@tanstack/react-query";
import { CasePreview } from "./types";

function useCasePreviews() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["case-previews"],
    queryFn: fetchCasePreviews,
  });
  return { data, isLoading, error };
}

function useCasePreview(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["case-preview", id],
    queryFn: () => fetchCasePreview(id),
  });
  return { data, isLoading, error };
}

function fetchCasePreviews() {
  return fetch("/data/case-previews.json").then((res) => res.json()) as Promise<
    CasePreview[]
  >;
}

function fetchCasePreview(id: string) {
  return fetch("/data/case-previews.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch case previews");
      return res.json() as Promise<CasePreview[]>;
    })
    .then((rows) => {
      const match = rows.find((row) => row.id === id);
      if (!match) throw new Error(`Case preview with id "${id}" not found`);
      return match;
    });
}

export { useCasePreviews, useCasePreview };
