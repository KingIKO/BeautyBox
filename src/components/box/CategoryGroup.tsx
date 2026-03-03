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
      <div className="section-divider mb-5">
        <h3
          id={`cat-${category}`}
          className="text-base font-semibold font-display text-foreground whitespace-nowrap px-3"
        >
          {category}
        </h3>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
