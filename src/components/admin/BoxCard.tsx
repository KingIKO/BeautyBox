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
      <article className="card p-6 flex flex-col hover:-translate-y-0.5 transition-all duration-300">
        {/* Top row: Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold font-display text-foreground leading-snug">
            {box.title}
          </h3>
          <span
            className={`
              flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold
              ${
                box.is_published
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-muted text-muted-foreground border border-border/60"
              }
            `}
          >
            {box.is_published ? "Published" : "Draft"}
          </span>
        </div>

        {/* Description preview */}
        {box.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {box.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          <span>Created {formattedDate(box.created_at)}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border/40">
          <Link href={`/admin/boxes/${box.id}`} className="btn-primary text-xs px-3.5 py-2">
            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
          <button onClick={handleCopy} className="btn-secondary text-xs px-3.5 py-2">
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="btn-ghost text-xs text-destructive hover:bg-destructive/5 px-3 py-2 ml-auto"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
