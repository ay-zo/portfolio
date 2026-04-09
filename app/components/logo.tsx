"use client";

import Image from "next/image";
import { cn } from "../lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}
export default function Logo({ size = 21, className = "" }: LogoProps) {
  return (
    <Image
      src="/image/logo.svg"
      alt="Company logo"
      width={size}
      height={size}
      priority
      className={cn("object-contain", className)}
    />
  );
}
