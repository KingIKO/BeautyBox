"use client";

import type { Product } from "@/types";
import ProductCard from "./ProductCard";

interface CategoryGroupProps {
  category: string;
  products: Product[];
}

export default function CategoryGroup({
  category,
  products,
}: CategoryGroupProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={`cat-${category}`}>
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <h3
          id={`cat-${category}`}
          className="text-base font-semibold font-display text-foreground whitespace-nowrap"
        >
          {category}
        </h3>
        <div className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
