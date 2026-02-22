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
    <article className="card p-3 flex items-center gap-3">
      {/* Thumbnail */}
      <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
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
            className="absolute inset-0 bg-gradient-to-br from-pink-100 to-amber-50"
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
            <span className="text-xs font-medium text-foreground">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={() => onMoveUp(product)}
          className="btn-ghost p-1.5"
          aria-label={`Move ${product.name} up`}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMoveDown(product)}
          className="btn-ghost p-1.5"
          aria-label={`Move ${product.name} down`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="btn-ghost p-1.5"
          aria-label={`Edit ${product.name}`}
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="btn-ghost p-1.5 text-destructive hover:bg-destructive/10"
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
