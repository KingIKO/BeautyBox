"use client";
import { useEffect, useState } from "react";
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
} from "lucide-react";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  day: <Sun className="w-4 h-4" />,
  night: <Moon className="w-4 h-4" />,
  party: <Sparkles className="w-4 h-4" />,
  everyday: <Heart className="w-4 h-4" />,
};

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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
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

  // Group products by category, maintaining sort order
  const categories = new Map<string, Product[]>();
  [...products]
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((p) => {
      const cat = p.category || "Other";
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(p);
    });

  // Group products by store for "Shop All" buttons
  const storeGroups = new Map<string, Product[]>();
  products.forEach((p) => {
    if (p.product_url) {
      if (!storeGroups.has(p.store)) storeGroups.set(p.store, []);
      storeGroups.get(p.store)!.push(p);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            </div>
            <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center text-white">
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
                {box.title}
              </h1>
              {box.description && (
                <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto">
                  {box.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50">
            <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                {box.title}
              </h1>
              {box.description && (
                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                  {box.description}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Event Tabs */}
      {sortedSections.length > 1 && (
        <div className="sticky top-12 z-40 bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              {sortedSections.map((section) => {
                const etConfig = EVENT_TYPES.find(
                  (e) => e.value === section.event_type
                );
                const isActive = activeTab === section.event_type;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.event_type)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {EVENT_ICONS[section.event_type]}
                    {etConfig?.label || section.event_type}
                    <span
                      className={`text-xs ${
                        isActive
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      ({(section.products || []).length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeSection?.description && (
          <p className="text-muted-foreground text-sm mb-6 text-center">
            {activeSection.description}
          </p>
        )}

        {categories.size === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No products in this section yet.
            </p>
          </div>
        ) : (
          <>
            {Array.from(categories.entries()).map(
              ([category, categoryProducts]) => (
                <div key={category} className="mb-10">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-px bg-border" />
                    {category}
                    <span className="w-8 h-px bg-border" />
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {categoryProducts.map((product) => {
                      const store = getStoreConfig(product.store);
                      return (
                        <div key={product.id} className="card overflow-hidden">
                          {/* Product Image */}
                          {product.image_url ? (
                            <div className="aspect-[4/3] bg-secondary">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300" />
                            </div>
                          )}

                          <div className="p-3 sm:p-4">
                            {/* Store Badge */}
                            <span
                              className={`inline-block text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium mb-1.5 sm:mb-2 ${store.bg} ${store.text}`}
                            >
                              {product.store}
                            </span>

                            {/* Brand */}
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                              {product.brand}
                            </p>

                            {/* Name */}
                            <h3 className="font-medium text-sm sm:text-base text-foreground mt-0.5 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Shade */}
                            {product.shade && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                Shade: {product.shade}
                              </p>
                            )}

                            {/* Price */}
                            {product.price != null && (
                              <p className="text-xs sm:text-sm font-semibold text-foreground mt-1.5 sm:mt-2">
                                ${Number(product.price).toFixed(2)}
                              </p>
                            )}

                            {/* Instructions */}
                            {product.instructions && (
                              <div className="mt-2 sm:mt-3 p-2 sm:p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                                <div className="flex items-start gap-1.5">
                                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-[10px] sm:text-xs text-amber-800 line-clamp-3">
                                    {product.instructions}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Shop Link */}
                            {product.product_url && (
                              <a
                                href={product.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary w-full mt-3 sm:mt-4 text-xs sm:text-sm py-2 sm:py-2.5"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Shop
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {/* Shop All by Store */}
            {storeGroups.size > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
                  Quick Shop by Store
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from(storeGroups.entries()).map(
                    ([storeName, storeProducts]) => {
                      const store = getStoreConfig(storeName);
                      return (
                        <div key={storeName} className="card p-4 text-center min-w-[140px]">
                          <span
                            className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-2 ${store.bg} ${store.text}`}
                          >
                            {storeName}
                          </span>
                          <p className="text-sm text-muted-foreground mb-3">
                            {storeProducts.length} product
                            {storeProducts.length !== 1 ? "s" : ""}
                          </p>
                          <div className="space-y-1">
                            {storeProducts.map((p) => (
                              <a
                                key={p.id}
                                href={p.product_url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-primary hover:underline truncate"
                              >
                                {p.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>
            <Sparkles className="w-3 h-3 inline-block mr-1" />
            Made with BeautyBox
          </p>
        </div>
      </footer>
    </div>
  );
}
