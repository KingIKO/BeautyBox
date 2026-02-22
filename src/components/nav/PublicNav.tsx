"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function PublicNav() {
  return (
    <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles
            className="h-5 w-5 text-accent transition-transform group-hover:rotate-12"
            aria-hidden="true"
          />
          <span className="text-lg font-display font-bold text-foreground tracking-tight">
            BeautyBox
          </span>
        </Link>
      </div>
    </nav>
  );
}
