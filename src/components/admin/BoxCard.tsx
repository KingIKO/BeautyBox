"use client";

import { useState } from "react";
import { Edit, Trash2, Copy, Package } from "lucide-react";
import Link from "next/link";
import type { Box } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface BoxCardProps {
  box: Box;
  onDelete: (id: string) => void;
}

export default function BoxCard({ box, onDelete }: BoxCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const productCount =
    box.sections?.reduce((sum, s) => sum + (s.products?.length ?? 0), 0) ?? 0;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/b/${box.slug}`
      : `/b/${box.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  const formattedDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <article className="card p-5">
        {/* Top row: Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold font-display text-foreground leading-snug">
            {box.title}
          </h3>
          <span
            className={`
              flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${
                box.is_published
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            {box.is_published ? "Published" : "Draft"}
          </span>
        </div>

        {/* Description preview */}
        {box.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {box.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          <span>Created {formattedDate(box.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/admin/boxes/${box.id}`} className="btn-primary text-xs px-3 py-1.5">
            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
          <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5">
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="btn-ghost text-xs text-destructive hover:bg-destructive/10 px-3 py-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </article>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => onDelete(box.id)}
        title="Delete Box"
        description={`Are you sure you want to delete "${box.title}"? This will permanently remove all sections and products inside it.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
