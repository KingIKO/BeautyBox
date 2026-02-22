"use client";

import { getStoreConfig } from "@/lib/store-config";

interface StoreBadgeProps {
  store: string;
}

export default function StoreBadge({ store }: StoreBadgeProps) {
  const config = getStoreConfig(store);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.name}
    </span>
  );
}
