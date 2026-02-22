"use client";

import { useState, useEffect, type FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import ImageUploader from "./ImageUploader";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { STORE_NAMES } from "@/lib/store-config";
import type { Product } from "@/types";

interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  price: string;
  store: string;
  product_url: string;
  image_url: string;
  shade: string;
  instructions: string;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData & { section_id: string }) => Promise<void>;
  sectionId: string;
  product?: Product;
}

const emptyForm: ProductFormData = {
  name: "",
  brand: "",
  category: PRODUCT_CATEGORIES[0],
  price: "",
  store: STORE_NAMES[0],
  product_url: "",
  image_url: "",
  shade: "",
  instructions: "",
};

export default function ProductForm({
  open,
  onClose,
  onSubmit,
  sectionId,
  product,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!product;

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price != null ? String(product.price) : "",
        store: product.store,
        product_url: product.product_url ?? "",
        image_url: product.image_url ?? "",
        shade: product.shade ?? "",
        instructions: product.instructions ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [product, open]);

  const update = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.brand.trim()) {
      setError("Name and brand are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ ...form, section_id: sectionId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Add Product"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-name" className="label">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="pf-name"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="pf-brand" className="label">
              Brand <span className="text-destructive">*</span>
            </label>
            <input
              id="pf-brand"
              type="text"
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Category + Store */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-category" className="label">
              Category
            </label>
            <select
              id="pf-category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="input-field"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-store" className="label">
              Store
            </label>
            <select
              id="pf-store"
              value={form.store}
              onChange={(e) => update("store", e.target.value)}
              className="input-field"
            >
              {STORE_NAMES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price + Shade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-price" className="label">
              Price
            </label>
            <input
              id="pf-price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="29.99"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="pf-shade" className="label">
              Shade
            </label>
            <input
              id="pf-shade"
              type="text"
              value={form.shade}
              onChange={(e) => update("shade", e.target.value)}
              placeholder="e.g. Natural Beige"
              className="input-field"
            />
          </div>
        </div>

        {/* Product URL */}
        <div>
          <label htmlFor="pf-url" className="label">
            Product URL
          </label>
          <input
            id="pf-url"
            type="url"
            value={form.product_url}
            onChange={(e) => update("product_url", e.target.value)}
            placeholder="https://www.sephora.com/..."
            className="input-field"
          />
        </div>

        {/* Image */}
        <ImageUploader
          value={form.image_url}
          onChange={(url) => update("image_url", url)}
        />

        {/* Instructions */}
        <div>
          <label htmlFor="pf-instructions" className="label">
            Instructions / Tips
          </label>
          <textarea
            id="pf-instructions"
            value={form.instructions}
            onChange={(e) => update("instructions", e.target.value)}
            rows={3}
            placeholder="Application tips, notes for the recipient..."
            className="input-field resize-y"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
