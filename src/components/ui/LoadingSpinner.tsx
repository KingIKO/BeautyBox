"use client";

import { Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, { container: string; icon: string }> = {
  sm: { container: "w-8 h-8 rounded-xl", icon: "w-4 h-4" },
  md: { container: "w-10 h-10 rounded-2xl", icon: "w-5 h-5" },
  lg: { container: "w-14 h-14 rounded-2xl", icon: "w-7 h-7" },
};

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const s = sizeClasses[size];
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className={`${s.container} bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-soft`}>
        <Sparkles className={`${s.icon} text-white`} />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
