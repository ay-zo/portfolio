"use client";

import { cn } from "@/app/lib/utils";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

interface CaseButtonProps {
  label: string;
  href: string;
  status: "confidential" | "public";
}

export default function CaseButton({ label, href, status }: CaseButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (status === "confidential") {
      router.push(href);
    }
  };

  const buttonClass = cn(
    "relative group text-label-lg uppercase tracking-wide text-secondary flex items-center gap-2 hover:text-primary transition-all duration-300 cursor-pointer",
    // underline
    "after:absolute after:left-0 after:-bottom-[8px] after:h-[2px] after:w-full",
    "after:origin-left after:scale-x-0",
    "after:bg-brand-primary",
    "after:transition-transform after:duration-300 after:ease-out",
    "hover:after:scale-x-100",
  );

  return status === "confidential" ? (
    <button className={buttonClass}>
      <Lock className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  ) : (
    <button className={buttonClass} onClick={handleClick}>
      <span>{label}</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}
