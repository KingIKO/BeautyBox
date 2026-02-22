"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
} from "lucide-react";
import type { BoxSection, Product } from "@/types";
import type { EventType } from "@/types";
import { EVENT_TYPES } from "@/lib/constants";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addSection,
  reorderProducts,
} from "@/lib/api";
import AdminProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface SectionManagerProps {
  boxId: string;
  sections: BoxSection[];
  onSectionsChange: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Moon,
  Sparkles,
  Heart,
};

export default function SectionManager({
  boxId,
  sections,
  onSectionsChange,
}: SectionManagerProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [addingSectionType, setAddingSectionType] = useState(false);

  // Determine which event types are not yet used
  const usedEventTypes = new Set(sections.map((s) => s.event_type));
  const availableEventTypes = EVENT_TYPES.filter(
    (et) => !usedEventTypes.has(et.value)
  );

  const toggleCollapse = (sectionId: string) => {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Open "Add Product" form for a section
  const handleAddProduct = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  // Open "Edit Product" form
  const handleEditProduct = (product: Product) => {
    setActiveSectionId(product.section_id);
    setEditingProduct(product);
    setShowProductForm(true);
  };

  // Submit product form (add or edit)
  const handleProductSubmit = async (
    data: {
      name: string;
      brand: string;
      category: string;
      price: string;
      store: string;
      product_url: string;
      image_url: string;
      shade: string;
      instructions: string;
      section_id: string;
    }
  ) => {
    const payload = {
      section_id: data.section_id,
      name: data.name.trim(),
      brand: data.brand.trim(),
      category: data.category,
      price: data.price ? parseFloat(data.price) : null,
      store: data.store,
      product_url: data.product_url.trim() || null,
      image_url: data.image_url.trim() || null,
      shade: data.shade.trim() || null,
      instructions: data.instructions.trim() || null,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(boxId, payload);
    }
    onSectionsChange();
  };

  // Delete a product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    await deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
    onSectionsChange();
  };

  // Reorder a product within its section
  const handleMoveProduct = async (
    product: Product,
    direction: "up" | "down"
  ) => {
    const section = sections.find((s) => s.id === product.section_id);
    if (!section?.products) return;

    const sorted = [...section.products].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const idx = sorted.findIndex((p) => p.id === product.id);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === sorted.length - 1)
    ) {
      return; // Already at boundary
    }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    // Swap sort orders
    const items = sorted.map((p, i) => {
      if (i === idx) return { id: p.id, sort_order: sorted[swapIdx].sort_order };
      if (i === swapIdx) return { id: p.id, sort_order: sorted[idx].sort_order };
      return { id: p.id, sort_order: p.sort_order };
    });

    await reorderProducts(items);
    onSectionsChange();
  };

  // Add a new section
  const handleAddSection = async (eventType: EventType) => {
    const maxOrder = sections.reduce(
      (max, s) => Math.max(max, s.sort_order),
      0
    );
    await addSection(boxId, {
      event_type: eventType,
      sort_order: maxOrder + 1,
    });
    setAddingSectionType(false);
    onSectionsChange();
  };

  return (
    <div className="space-y-4">
      {sections
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((section) => {
          const eventConfig = EVENT_TYPES.find(
            (et) => et.value === section.event_type
          );
          const Icon = eventConfig ? iconMap[eventConfig.icon] : Package;
          const isCollapsed = collapsed[section.id] ?? false;
          const products = (section.products ?? []).sort(
            (a, b) => a.sort_order - b.sort_order
          );

          return (
            <section
              key={section.id}
              className="card overflow-hidden"
              aria-labelledby={`section-${section.id}`}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleCollapse(section.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                aria-expanded={!isCollapsed}
                id={`section-${section.id}`}
              >
                {Icon && (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${eventConfig?.color ?? "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
                <span className="flex-1 font-semibold text-sm">
                  {eventConfig?.label ?? section.event_type}
                </span>
                <span className="text-xs text-muted-foreground mr-2">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                </span>
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Section Body */}
              {!isCollapsed && (
                <div className="border-t border-border px-4 py-3 space-y-2">
                  {products.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products yet. Add your first one below.
                    </p>
                  )}

                  {products.map((product) => (
                    <AdminProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={setDeletingProduct}
                      onMoveUp={(p) => handleMoveProduct(p, "up")}
                      onMoveDown={(p) => handleMoveProduct(p, "down")}
                    />
                  ))}

                  <button
                    onClick={() => handleAddProduct(section.id)}
                    className="btn-secondary w-full mt-2 text-sm"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Product
                  </button>
                </div>
              )}
            </section>
          );
        })}

      {/* Add Section button / dropdown */}
      {availableEventTypes.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setAddingSectionType(!addingSectionType)}
            className="btn-secondary w-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Section
          </button>

          {addingSectionType && (
            <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
              {availableEventTypes.map((et) => {
                const Icon = iconMap[et.icon];
                return (
                  <button
                    key={et.value}
                    onClick={() => handleAddSection(et.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left text-sm"
                  >
                    {Icon && (
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-md ${et.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                    {et.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        open={showProductForm}
        onClose={() => {
          setShowProductForm(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleProductSubmit}
        sectionId={activeSectionId}
        product={editingProduct}
      />

      {/* Delete Product Confirm */}
      <ConfirmDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        description={
          deletingProduct
            ? `Are you sure you want to delete "${deletingProduct.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
