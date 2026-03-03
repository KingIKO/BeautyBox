"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBox } from "@/lib/api";
import { Sparkles, LogOut, ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function NewBoxPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const box = await createBox({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/admin/boxes/${box.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create box");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="max-w-2xl mx-auto px-5 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          Create New Box
        </h1>

        <form onSubmit={handleSubmit} className="card p-7 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="label">
              Box Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Summer Glow Essentials"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              This will be visible to anyone with the link
            </p>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[120px] resize-y"
              placeholder="A curated collection of products for the perfect summer look..."
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-border/40">
            <button type="submit" disabled={loading || !title.trim()} className="btn-primary">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Box
                </>
              )}
            </button>
            <Link href="/admin" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
