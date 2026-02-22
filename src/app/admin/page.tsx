"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAdminBoxes, deleteBox } from "@/lib/api";
import type { Box } from "@/types";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  LogOut,
  Package,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    setLoading(true);
    getAdminBoxes()
      .then(setBoxes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBox(id);
      setBoxes((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/b/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-display text-lg font-bold text-foreground">
                BeautyBox
              </span>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Admin
            </span>
          </div>
          <button onClick={signOut} className="btn-ghost text-sm">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Your Boxes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage beauty recommendation boxes
            </p>
          </div>
          <Link href="/admin/boxes/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Box
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {boxes.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No boxes yet
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first beauty recommendation box to share with friends
              and family.
            </p>
            <Link href="/admin/boxes/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Your First Box
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boxes.map((box) => (
              <div key={box.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                    {box.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                      box.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {box.is_published ? (
                      <Eye className="w-3 h-3 inline mr-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 inline mr-1" />
                    )}
                    {box.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                {box.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {box.description}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mb-4">
                  /b/{box.slug}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/boxes/${box.id}`}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleCopyLink(box.slug)}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied === box.slug ? "Copied!" : "Copy Link"}
                  </button>
                  {box.is_published && (
                    <Link
                      href={`/b/${box.slug}`}
                      target="_blank"
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>
                  )}
                  {deleteConfirm === box.id ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => handleDelete(box.id)}
                        className="btn-danger text-xs px-3 py-1.5"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(box.id)}
                      className="btn-ghost text-xs px-3 py-1.5 text-destructive ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
