"use client";

import { Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";
import StoreBadge from "@/components/box/StoreBadge";

interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onMoveUp: (product: Product) => void;
  onMoveDown: (product: Product) => void;
}

export default function AdminProductCard({
  product,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: AdminProductCardProps) {
  return (
    <article className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
      {/* Thumbnail */}
      <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border/40">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-pink-50 to-amber-50"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">{product.brand}</span>
          <StoreBadge store={product.store} />
          {product.price != null && (
            <span className="text-xs font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={() => onMoveUp(product)}
          className="p-1.5 rounded-lg hover:bg-white/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Move ${product.name} up`}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMoveDown(product)}
          className="p-1.5 rounded-lg hover:bg-white/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Move ${product.name} down`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="p-1.5 rounded-lg hover:bg-white/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
