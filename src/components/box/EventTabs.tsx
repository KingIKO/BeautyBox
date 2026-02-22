"use client";

import { Sun, Moon, Sparkles, Heart } from "lucide-react";
import type { BoxSection } from "@/types";
import { EVENT_TYPES } from "@/lib/constants";

interface EventTabsProps {
  sections: BoxSection[];
  activeTab: string;
  onTabChange: (eventType: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Moon,
  Sparkles,
  Heart,
};

export default function EventTabs({
  sections,
  activeTab,
  onTabChange,
}: EventTabsProps) {
  // Only show tabs for event types that have sections
  const sectionTypes = new Set(sections.map((s) => s.event_type));
  const availableTabs = EVENT_TYPES.filter((et) => sectionTypes.has(et.value));

  if (availableTabs.length <= 1) return null;

  return (
    <div
      className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border pb-px -mb-px"
      role="tablist"
      aria-label="Event type tabs"
    >
      {availableTabs.map((tab) => {
        const Icon = iconMap[tab.icon];
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.value}`}
            onClick={() => onTabChange(tab.value)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap
              border-b-2 transition-colors rounded-t-lg
              ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
              }
            `}
          >
            {Icon && (
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
