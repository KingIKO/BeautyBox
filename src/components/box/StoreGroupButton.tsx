"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { getStoreConfig } from "@/lib/store-config";

interface StoreGroupButtonProps {
  store: string;
  products: Product[];
  onViewProducts: () => void;
}

export default function StoreGroupButton({
  store,
  products,
  onViewProducts,
}: StoreGroupButtonProps) {
  const config = getStoreConfig(store);
  const count = products.length;

  return (
    <button
      onClick={onViewProducts}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-lg border
        ${config.border} ${config.bg} ${config.text}
        hover:opacity-90 transition-opacity text-left
      `}
    >
      <ShoppingBag className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{config.name}</p>
        <p className="text-xs opacity-80">
          View all {count} {count === 1 ? "product" : "products"} at{" "}
          {config.name}
        </p>
      </div>
    </button>
  );
}
