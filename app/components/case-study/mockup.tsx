"use client";

import { useEffect, useState } from "react";
import { cn } from "@/app/lib/utils";

interface MockupProps {
  className?: string;
  id: string;
  align: "left" | "right";
}

export default function Mockup({ className, id, align }: MockupProps) {
  const [gradient, setGradient] = useState<{
    from: string;
    to: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/mockup-gradient?image=/image/case-mockup/${id}.png`)
      .then((res) => res.json())
      .then(setGradient);
  }, [id]);

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-3xl corner-smoothing-[0.6]",
        className || "",
      )}
      style={{
        backgroundImage: gradient
          ? `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`
          : undefined,
      }}
    >
      <img
        src={`/image/case-mockup/${id}.png`}
        alt={id}
        className={cn(
          "absolute top-1/2 h-150 -translate-y-1/2",
          align === "left" ? "-right-1/8" : "-left-1/8",
        )}
      />
    </div>
  );
}
