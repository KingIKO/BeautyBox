"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";
import StoreBadge from "./StoreBadge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="card overflow-hidden flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Brand */}
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {product.name}
        </h3>

        {/* Price + Store */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.price != null && (
            <span className="text-sm font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          )}
          <StoreBadge store={product.store} />
        </div>

        {/* Shade */}
        {product.shade && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Shade:</span> {product.shade}
          </p>
        )}

        {/* Instructions / Tips */}
        {product.instructions && (
          <div className="mt-1 rounded-lg bg-secondary p-3 text-xs text-muted-foreground leading-relaxed">
            {product.instructions}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Shop Now Link */}
        {product.product_url && (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-2 w-full text-center text-sm"
          >
            Shop Now
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
