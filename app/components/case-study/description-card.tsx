"use client";

import { cn } from "@/app/lib/utils";
import CaseButton from "./case-button";

interface DescriptionCardProps {
  tags: string[];
  year: string;
  caseTitle: string;
  caseSummary: string;
  impact: string[];
  status: "confidential" | "public";
  className?: string;
}

export default function DescriptionCard({
  tags,
  year,
  caseTitle,
  caseSummary,
  impact,
  status,
  className,
}: DescriptionCardProps) {
  return (
    <div
      className={cn(
        "h-full flex flex-col justify-between bg-surface-1/80 border border-stroke rounded-3xl corner-smoothing-[0.6]",
        "px-12 pt-36 pb-12",
        "shadow-lg",
        className || "",
      )}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-row items-center gap-2 text-secondary uppercase text-label-sm font-medium font-label w-full">
          <div className="flex flex-row items-center">
            {tags.map((tag, index) => (
              <div className="flex flex-row items-center gap-0" key={index}>
                {tag}
                {index < tags.length - 1 && <p className="mx-1"> / </p>}
              </div>
            ))}
          </div>
          <div className="w-1 h-1 rounded-[9999] bg-current" />
          <p>{year}</p>
        </div>
        <div className="flex flex-col gap-4 max-w-[85%]">
          <h2 className="text-headline font-semibold uppercase leading-headline">
            {caseTitle}
          </h2>
          <p className="text-title font-title leading-title text-secondary">
            {caseSummary}
          </p>
        </div>
      </div>
      <div className="flex gap-10">
        {impact.map((item, i) => {
          const [value, ...rest] = item.split(" ");
          const label = rest.join(" ");
          return (
            <div key={i} className="flex flex-col">
              <p className="text-headline font-semibold leading-headline text-secondary">
                {value}
              </p>
              <p className="text-label-sm text-muted uppercase">{label}</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-row w-full justify-center">
        <CaseButton
          label={status === "confidential" ? "Contact me" : "View Case Study"}
          href="/case-studies/flight-ops"
          status={status}
        />
      </div>
    </div>
  );
}
