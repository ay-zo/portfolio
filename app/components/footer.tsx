"use client";

import { FaLinkedinIn } from "react-icons/fa";
import { Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkedinClick = () => {
    window.open("https://www.linkedin.com/in/andyzhuo/", "_blank");
  };

  const handleEmailClick = () => {
    window.open("mailto:andyzhuo101@gmail.com", "_blank");
  };

  return (
    <footer className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="flex flex-row items-center justify-center gap-4">
        <button
          className="flex flex-row items-center justify-center gap-4 aspect-square w-8 bg-surface-2/20 hover:bg-surface-2/40 border border-stroke rounded-lg hover:cursor-pointer hover:text-brand-primary text-secondary"
          onClick={handleEmailClick}
        >
          <Mail className=" w-5 h-5 stroke-[1.5]" />
        </button>
        <button
          className="flex flex-row items-center justify-center gap-4 aspect-square w-8 bg-surface-2/20 hover:bg-surface-2/40 border border-stroke rounded-lg hover:cursor-pointer hover:text-brand-primary text-secondary"
          onClick={handleLinkedinClick}
        >
          <FaLinkedinIn className=" text-lg" />
        </button>
      </div>
      <p className="text-secondary text-label-sm font-label">
        &copy; <span suppressHydrationWarning>{currentYear}</span> Andy Zhuo. All rights reserved.
      </p>
    </footer>
  );
}
