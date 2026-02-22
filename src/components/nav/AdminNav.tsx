"use client";

import { Sparkles, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AdminNav() {
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Admin badge */}
        <Link href="/admin" className="flex items-center gap-2 group">
          <Sparkles
            className="h-5 w-5 text-accent transition-transform group-hover:rotate-12"
            aria-hidden="true"
          />
          <span className="text-lg font-display font-bold text-foreground tracking-tight">
            BeautyBox
          </span>
          <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Admin
          </span>
        </Link>

        {/* Right: Sign out */}
        <button onClick={signOut} className="btn-ghost text-sm">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
