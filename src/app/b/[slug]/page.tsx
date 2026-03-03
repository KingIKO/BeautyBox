"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getBoxBySlug } from "@/lib/api";
import { EVENT_TYPES } from "@/lib/constants";
import { getStoreConfig } from "@/lib/store-config";
import type { Box, Product } from "@/types";
import {
  Sparkles,
  Sun,
  Moon,
  Heart,
  ExternalLink,
  ShoppingBag,
  Package,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  day: <Sun className="w-4 h-4" />,
  night: <Moon className="w-4 h-4" />,
  party: <Sparkles className="w-4 h-4" />,
  everyday: <Heart className="w-4 h-4" />,
};

/* ─── Swipeable Carousel ─── */
function ProductCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      {/* Scroll buttons - desktop only */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                     w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-border/60
                     items-center justify-center shadow-soft
                     opacity-0 group-hover/carousel:opacity-100 transition-all duration-300
                     hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                     w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-border/60
                     items-center justify-center shadow-soft
                     opacity-0 group-hover/carousel:opacity-100 transition-all duration-300
                     hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent z-[1] pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent z-[1] pointer-events-none" />
      )}

      {/* Scrollable track */}
      <div ref={scrollRef} className="carousel-scroll px-1">
        {products.map((product) => {
          const store = getStoreConfig(product.store);
          return (
            <div
              key={product.id}
              className="w-[260px] sm:w-[280px] flex-shrink-0"
            >
              <div className="card product-card-glow overflow-hidden h-full flex flex-col group hover:-translate-y-1 transition-all duration-300">
                {/* Product Image */}
                {product.image_url ? (
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-pink-200" />
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                  {/* Store Badge */}
                  <span
                    className={`inline-flex self-start text-[10px] px-2 py-0.5 rounded-full font-semibold mb-2 ${store.bg} ${store.text}`}
                  >
                    {product.store}
                  </span>

                  {/* Brand */}
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    {product.brand}
                  </p>

                  {/* Name */}
                  <h3 className="font-semibold text-sm text-foreground mt-0.5 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>

                  {/* Shade */}
                  {product.shade && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-pink-200 to-amber-200 inline-block" />
                      {product.shade}
                    </p>
                  )}

                  {/* Price */}
                  {product.price != null && (
                    <p className="text-sm font-bold text-foreground mt-2">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  )}

                  {/* Instructions */}
                  {product.instructions && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-100/60">
                      <div className="flex items-start gap-1.5">
                        <MessageCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-amber-700 line-clamp-3 leading-relaxed">
                          {product.instructions}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Shop Link */}
                  {product.product_url && (
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full mt-4 text-xs py-2.5 rounded-xl"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Shop Now
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SharedBoxPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    getBoxBySlug(slug)
      .then((data) => {
        setBox(data);
        if (data.sections && data.sections.length > 0) {
          const sorted = [...data.sections].sort(
            (a, b) => a.sort_order - b.sort_order
          );
          setActiveTab(sorted[0].event_type);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-soft">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-primary/40 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Package className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Box Not Found
          </h1>
          <p className="text-muted-foreground text-sm">
            This recommendation box doesn&apos;t exist or isn&apos;t published yet.
          </p>
        </div>
      </div>
    );
  }

  const sortedSections = [...(box.sections || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const activeSection = sortedSections.find(
    (s) => s.event_type === activeTab
  );
  const products = activeSection?.products || [];

  // Group products by category
  const categories = new Map<string, Product[]>();
  [...products]
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((p) => {
      const cat = p.category || "Other";
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(p);
    });

  // Group by store
  const storeGroups = new Map<string, Product[]>();
  products.forEach((p) => {
    if (p.product_url) {
      if (!storeGroups.has(p.store)) storeGroups.set(p.store, []);
      storeGroups.get(p.store)!.push(p);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Glass Nav */}
      <nav className="glass-nav">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-sm font-bold text-foreground">
              BeautyBox
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {box.cover_image_url ? (
          <>
            <div className="absolute inset-0">
              <img
                src={box.cover_image_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            </div>
            <div className="relative max-w-5xl mx-auto px-5 py-20 md:py-28 text-center text-white">
              <h1 className="animate-slide-up font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {box.title}
              </h1>
              {box.description && (
                <p className="animate-slide-up stagger-1 text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed" style={{ animationFillMode: "backwards" }}>
                  {box.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="relative overflow-hidden">
            <AnimatedGradient colors={["#fb7185", "#f9a8d4", "#fcd34d"]} speed={0.05} blur="medium" />
            <div className="relative max-w-5xl mx-auto px-5 py-16 md:py-24 text-center">
              <h1 className="animate-slide-up font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {box.title}
              </h1>
              {box.description && (
                <p className="animate-slide-up stagger-1 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" style={{ animationFillMode: "backwards" }}>
                  {box.description}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Event Tabs - Pill Style */}
      {sortedSections.length > 1 && (
        <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
          <div className="max-w-5xl mx-auto px-5 py-2.5">
            <div className="pill-tabs inline-flex">
              {sortedSections.map((section) => {
                const etConfig = EVENT_TYPES.find(
                  (e) => e.value === section.event_type
                );
                const isActive = activeTab === section.event_type;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.event_type)}
                    className="pill-tab"
                    data-active={isActive}
                  >
                    {EVENT_ICONS[section.event_type]}
                    {etConfig?.label || section.event_type}
                    <span className="text-[11px] opacity-60">
                      {(section.products || []).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        {activeSection?.description && (
          <p className="text-muted-foreground text-sm mb-8 text-center max-w-lg mx-auto leading-relaxed">
            {activeSection.description}
          </p>
        )}

        {categories.size === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm">
              No products in this section yet.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Array.from(categories.entries()).map(
              ([category, categoryProducts], index) => (
                <section
                  key={category}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Category Header */}
                  <div className="section-divider mb-5">
                    <h2 className="font-display text-lg font-semibold text-foreground whitespace-nowrap px-3">
                      {category}
                    </h2>
                  </div>

                  {/* Horizontal Swipe Carousel */}
                  <ProductCarousel products={categoryProducts} />
                </section>
              )
            )}

            {/* Shop All by Store */}
            {storeGroups.size > 0 && (
              <div className="mt-12 pt-10 border-t border-border/60">
                <div className="section-divider mb-6">
                  <h2 className="font-display text-lg font-semibold text-foreground whitespace-nowrap px-3">
                    Quick Shop by Store
                  </h2>
                </div>
                <div className="carousel-scroll px-1">
                  {Array.from(storeGroups.entries()).map(
                    ([storeName, storeProducts]) => {
                      const store = getStoreConfig(storeName);
                      return (
                        <div key={storeName} className="w-[200px] flex-shrink-0">
                          <div className="card p-5 text-center h-full">
                            <span
                              className={`inline-block text-xs px-3 py-1 rounded-full font-semibold mb-3 ${store.bg} ${store.text}`}
                            >
                              {storeName}
                            </span>
                            <p className="text-sm text-muted-foreground mb-4">
                              {storeProducts.length} product
                              {storeProducts.length !== 1 ? "s" : ""}
                            </p>
                            <div className="space-y-1.5">
                              {storeProducts.map((p) => (
                                <a
                                  key={p.id}
                                  href={p.product_url!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-primary hover:underline truncate leading-relaxed"
                                >
                                  {p.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-display font-bold text-muted-foreground">
              BeautyBox
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            Curated beauty, shared with love
          </p>
        </div>
      </footer>
    </div>
  );
}
