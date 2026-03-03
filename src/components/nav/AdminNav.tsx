"use client";

import { Sparkles, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AdminNav() {
  const { signOut } = useAuth();

  return (
    <nav className="glass-nav">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Left: Logo + Admin badge */}
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-display font-bold text-foreground tracking-tight">
            BeautyBox
          </span>
          <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/8 text-primary">
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
