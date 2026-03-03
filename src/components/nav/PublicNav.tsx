"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function PublicNav() {
  return (
    <nav className="glass-nav">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-display font-bold text-foreground tracking-tight">
            BeautyBox
          </span>
        </Link>
      </div>
    </nav>
  );
}
