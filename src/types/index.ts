export interface Box {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sections?: BoxSection[];
}

export type EventType = "day" | "night" | "party" | "everyday";

export interface BoxSection {
  id: string;
  box_id: string;
  event_type: EventType;
  description: string | null;
  sort_order: number;
  created_at: string;
  products?: Product[];
}

export interface Product {
  id: string;
  section_id: string;
  name: string;
  brand: string;
  category: string;
  price: number | null;
  product_url: string | null;
  image_url: string | null;
  store: string;
  shade: string | null;
  instructions: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type StoreName =
  | "Sephora"
  | "Ulta"
  | "CVS"
  | "Amazon"
  | "Target"
  | "Walmart"
  | "Glossier"
  | "Other";
