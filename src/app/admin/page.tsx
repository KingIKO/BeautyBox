"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  LayoutGrid,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { AdvancedButton } from "@/components/ui/gradient-button";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";
import { StatsCard } from "@/components/admin/StatsCard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboardPage() {
  const router = useRouter();
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

  const publishedCount = boxes.filter((b) => b.is_published).length;
  const draftCount = boxes.length - publishedCount;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-soft">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Glass Nav */}
      <nav className="glass-nav">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                BeautyBox
              </span>
            </Link>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/8 text-primary font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <button onClick={signOut} className="btn-ghost text-sm">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Welcome Hero */}
      <section className="relative overflow-hidden">
        <AnimatedGradient
          colors={["#fda4af", "#fbcfe8", "#fde68a"]}
          speed={0.05}
          blur="medium"
        />
        <div className="relative max-w-6xl mx-auto px-5 py-10 md:py-14">
          <div className="text-center mb-8">
            <h1 className="animate-slide-up font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {getGreeting()} ✨
            </h1>
            {user?.email && (
              <p className="animate-slide-up stagger-1 text-sm text-muted-foreground" style={{ animationFillMode: "backwards" }}>
                {user.email}
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto animate-slide-up stagger-2" style={{ animationFillMode: "backwards" }}>
            <StatsCard
              label="Total Boxes"
              value={boxes.length}
              icon={LayoutGrid}
              accentColor="#f43f5e"
            />
            <StatsCard
              label="Published"
              value={publishedCount}
              icon={CheckCircle2}
              accentColor="#10b981"
            />
            <StatsCard
              label="Drafts"
              value={draftCount}
              icon={FileText}
              accentColor="#f59e0b"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Your Boxes
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Create and manage beauty recommendation boxes
            </p>
          </div>
          <AdvancedButton
            onClick={() => router.push("/admin/boxes/new")}
            variant="primary"
            size="medium"
            className="flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Box
          </AdvancedButton>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-sm mb-8">
            {error}
          </div>
        )}

        {boxes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No boxes yet
            </h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
              Create your first beauty recommendation box to share with friends
              and family.
            </p>
            <Link href="/admin/boxes/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Your First Box
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boxes.map((box) => (
              <div
                key={box.id}
                className="card overflow-hidden flex flex-col hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Gradient accent strip */}
                <div
                  className={`h-1 w-full ${
                    box.is_published
                      ? "bg-gradient-to-r from-rose-400 to-amber-400"
                      : "bg-gradient-to-r from-muted to-border"
                  }`}
                />

                {/* Cover image thumbnail */}
                {box.cover_image_url && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={box.cover_image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                      {box.title}
                    </h3>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                        box.is_published
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      {box.is_published ? (
                        <Eye className="w-3 h-3 inline mr-1 -mt-px" />
                      ) : (
                        <EyeOff className="w-3 h-3 inline mr-1 -mt-px" />
                      )}
                      {box.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {box.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {box.description}
                    </p>
                  )}

                  {/* Slug + product count */}
                  <div className="flex items-center gap-3 mb-5">
                    <p className="text-xs text-muted-foreground/60 font-mono">
                      /b/{box.slug}
                    </p>
                    {box.sections && box.sections.length > 0 && (
                      <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {box.sections.reduce(
                          (sum, s) => sum + (s.products?.length || 0),
                          0
                        )}{" "}
                        products
                      </span>
                    )}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border/40">
                    <Link
                      href={`/admin/boxes/${box.id}`}
                      className="btn-primary text-xs px-3.5 py-2"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleCopyLink(box.slug)}
                      className="btn-secondary text-xs px-3.5 py-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied === box.slug ? "Copied!" : "Copy Link"}
                    </button>
                    {box.is_published && (
                      <Link
                        href={`/b/${box.slug}`}
                        target="_blank"
                        className="btn-ghost text-xs px-2.5 py-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {deleteConfirm === box.id ? (
                      <div className="flex items-center gap-1.5 ml-auto">
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
                        className="btn-ghost text-xs px-2.5 py-2 text-destructive hover:bg-destructive/5 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
