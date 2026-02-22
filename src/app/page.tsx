import Link from "next/link";
import { Sparkles, Gift, ShoppingBag, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              BeautyBox
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Curated Beauty,{" "}
            <span className="text-primary">Shared with Love</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Personalized makeup and skincare recommendations for every occasion.
            Day looks, night glam, party ready — all handpicked just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin" className="btn-primary text-base px-8 py-3">
              <Gift className="w-5 h-5" />
              Create a Box
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Curate by Occasion
            </h3>
            <p className="text-muted-foreground text-sm">
              Organize your favorite products into Day, Night, and Party looks.
              Every recommendation tells a story.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Share with Anyone
            </h3>
            <p className="text-muted-foreground text-sm">
              Send a single link to friends, family, or clients. No account
              needed — just open and browse.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Shop by Store
            </h3>
            <p className="text-muted-foreground text-sm">
              Products link directly to Sephora, Ulta, CVS, and more. Grouped by
              store for easy shopping.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            <Sparkles className="w-4 h-4 inline-block mr-1" />
            BeautyBox — Curated beauty, shared with love.
          </p>
        </div>
      </footer>
    </div>
  );
}
