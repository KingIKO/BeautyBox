"use client";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accentColor: string;
}

export function StatsCard({ label, value, icon: Icon, accentColor }: StatsCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 p-5 flex flex-col items-center gap-2 shadow-sm">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: accentColor + "20" }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <span className="text-2xl font-bold text-foreground">
        <AnimatedCounter value={value} />
      </span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
