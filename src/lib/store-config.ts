export interface StoreConfig {
  name: string;
  bg: string;
  text: string;
  border: string;
}

export const STORES: Record<string, StoreConfig> = {
  Sephora: {
    name: "Sephora",
    bg: "bg-black",
    text: "text-white",
    border: "border-black",
  },
  Ulta: {
    name: "Ulta",
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-600",
  },
  CVS: {
    name: "CVS",
    bg: "bg-red-600",
    text: "text-white",
    border: "border-red-700",
  },
  Amazon: {
    name: "Amazon",
    bg: "bg-amber-400",
    text: "text-gray-900",
    border: "border-amber-500",
  },
  Target: {
    name: "Target",
    bg: "bg-red-500",
    text: "text-white",
    border: "border-red-600",
  },
  Walmart: {
    name: "Walmart",
    bg: "bg-blue-600",
    text: "text-white",
    border: "border-blue-700",
  },
  Glossier: {
    name: "Glossier",
    bg: "bg-pink-300",
    text: "text-gray-900",
    border: "border-pink-400",
  },
  Other: {
    name: "Other",
    bg: "bg-gray-200",
    text: "text-gray-800",
    border: "border-gray-300",
  },
};

export const STORE_NAMES = Object.keys(STORES);

export function getStoreConfig(store: string): StoreConfig {
  return STORES[store] || STORES.Other;
}
