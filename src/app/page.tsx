"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Gift, ShoppingBag, Heart, ArrowRight, Star } from "lucide-react";
import { AdvancedButton } from "@/components/ui/gradient-button";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      {/* Glass Nav */}
      <nav className="glass-nav">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              BeautyBox
            </span>
          </Link>
          <Link
            href="/admin"
            className="btn-ghost text-sm"
          >
            Admin
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-rose-100 via-pink-50 via-50% to-amber-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-4xl mx-auto px-5 py-28 md:py-40 text-center">
          {/* Badge */}
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-white/40 text-sm text-muted-foreground mb-8 shadow-soft">
            <Star className="w-3.5 h-3.5 text-accent" />
            Curated beauty recommendations
          </div>

          <h1 className="animate-slide-up stagger-1 font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight" style={{ animationFillMode: "backwards" }}>
            Beauty Picks,{" "}
            <span className="gradient-text">Shared with Love</span>
          </h1>

          <p className="animate-slide-up stagger-2 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed" style={{ animationFillMode: "backwards" }}>
            Personalized makeup and skincare recommendations for every occasion.
            Day looks, night glam, party ready — all handpicked just for you.
          </p>

          <div className="animate-slide-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center" style={{ animationFillMode: "backwards" }}>
            <AdvancedButton
              onClick={() => router.push("/admin")}
              variant="gradient"
              size="large"
              className="rounded-2xl"
            >
              <Gift className="w-5 h-5" />
              Create a Box
              <ArrowRight className="w-4 h-4" />
            </AdvancedButton>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps to share your favorite beauty products with anyone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              iconBg: "bg-amber-50",
              iconColor: "text-amber-500",
              title: "Curate by Occasion",
              desc: "Organize your favorite products into Day, Night, and Party looks. Every recommendation tells a story.",
            },
            {
              icon: Heart,
              iconBg: "bg-pink-50",
              iconColor: "text-pink-500",
              title: "Share with Anyone",
              desc: "Send a single link to friends, family, or clients. No account needed — just open and browse.",
            },
            {
              icon: ShoppingBag,
              iconBg: "bg-rose-50",
              iconColor: "text-rose-500",
              title: "Shop by Store",
              desc: "Products link directly to Sephora, Ulta, CVS, and more. Grouped by store for easy shopping.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card p-8 text-center group hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-display text-sm font-bold text-foreground">
              BeautyBox
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Curated beauty, shared with love.
          </p>
        </div>
      </footer>
    </div>
  );
}
