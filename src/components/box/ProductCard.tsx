"use client";

import { ExternalLink, ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";
import StoreBadge from "./StoreBadge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="card overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 flex items-center justify-center"
            aria-hidden="true"
          >
            <ShoppingBag className="w-10 h-10 text-pink-200" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
        {/* Brand */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {product.name}
        </h3>

        {/* Price + Store */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.price != null && (
            <span className="text-sm font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          )}
          <StoreBadge store={product.store} />
        </div>

        {/* Shade */}
        {product.shade && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-pink-200 to-amber-200 inline-block" />
            {product.shade}
          </p>
        )}

        {/* Instructions / Tips */}
        {product.instructions && (
          <div className="mt-1 rounded-xl bg-amber-50/80 border border-amber-100/60 p-3 text-[11px] text-amber-700 leading-relaxed">
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
