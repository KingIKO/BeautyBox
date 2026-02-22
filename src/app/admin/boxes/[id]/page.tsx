"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminBox,
  updateBox,
  addSection,
  deleteSection,
  addProduct,
  updateProduct,
  deleteProduct,
  scrapeProductUrl,
} from "@/lib/api";
import { EVENT_TYPES, PRODUCT_CATEGORIES } from "@/lib/constants";
import { STORE_NAMES, getStoreConfig } from "@/lib/store-config";
import type { Box, Product, EventType } from "@/types";
import Link from "next/link";
import {
  Sparkles,
  LogOut,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sun,
  Moon,
  Heart,
  X,
  Package,
  Wand2,
  Loader2,
} from "lucide-react";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  day: <Sun className="w-4 h-4" />,
  night: <Moon className="w-4 h-4" />,
  party: <Sparkles className="w-4 h-4" />,
  everyday: <Heart className="w-4 h-4" />,
};

export default function BoxEditorPage() {
  const params = useParams();
  const { user, loading: authLoading, signOut } = useAuth();
  const boxId = params.id as string;

  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Product form modal
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSectionId, setProductSectionId] = useState<string>("");
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "Other",
    price: "",
    store: "Sephora",
    product_url: "",
    image_url: "",
    shade: "",
    instructions: "",
  });
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const handleAutoFill = async () => {
    const url = productForm.product_url.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setScrapeError("Please enter a valid URL");
      return;
    }
    setScraping(true);
    setScrapeError(null);
    try {
      const data = await scrapeProductUrl(url);
      setProductForm((prev) => ({
        ...prev,
        name: prev.name || data.name || "",
        brand: prev.brand || data.brand || "",
        price: prev.price || data.price || "",
        image_url: prev.image_url || data.image_url || "",
        store: data.store || prev.store,
        category: data.category || prev.category,
      }));
    } catch (err) {
      setScrapeError(
        err instanceof Error ? err.message : "Could not fetch product details"
      );
    } finally {
      setScraping(false);
    }
  };

  const fetchBox = useCallback(async () => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const data = await getAdminBox(boxId);
      setBox(data);
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description || "");
      setIsPublished(data.is_published);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load box");
    } finally {
      setLoading(false);
    }
  }, [boxId, user, authLoading]);

  useEffect(() => {
    fetchBox();
  }, [fetchBox]);

  const handleSaveMetadata = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBox(boxId, {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        is_published: isPublished,
      });
      setBox(updated);
      setSuccess("Saved!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (eventType: EventType) => {
    try {
      const etConfig = EVENT_TYPES.find((e) => e.value === eventType);
      await addSection(boxId, {
        event_type: eventType,
        sort_order: etConfig ? EVENT_TYPES.indexOf(etConfig) : 0,
      });
      await fetchBox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSection(boxId, sectionId);
      await fetchBox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete section");
    }
  };

  const openProductForm = (sectionId: string, product?: Product) => {
    setProductSectionId(sectionId);
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price?.toString() || "",
        store: product.store,
        product_url: product.product_url || "",
        image_url: product.image_url || "",
        shade: product.shade || "",
        instructions: product.instructions || "",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        brand: "",
        category: "Other",
        price: "",
        store: "Sephora",
        product_url: "",
        image_url: "",
        shade: "",
        instructions: "",
      });
    }
    setScraping(false);
    setScrapeError(null);
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.brand.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        category: productForm.category,
        price: productForm.price ? parseFloat(productForm.price) : null,
        store: productForm.store,
        product_url: productForm.product_url.trim() || null,
        image_url: productForm.image_url.trim() || null,
        shade: productForm.shade.trim() || null,
        instructions: productForm.instructions.trim() || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await addProduct(boxId, { ...data, section_id: productSectionId } as Parameters<typeof addProduct>[1]);
      }
      setShowProductForm(false);
      await fetchBox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      await fetchBox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/b/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const existingEventTypes = new Set(
    box?.sections?.map((s) => s.event_type) || []
  );
  const availableEventTypes = EVENT_TYPES.filter(
    (et) => !existingEventTypes.has(et.value)
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!box) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Box not found</p>
          <Link href="/admin" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-4">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-4">
            {success}
          </div>
        )}

        {/* Box Metadata */}
        <div className="card p-6 mb-6">
          <h2 className="font-display text-xl font-semibold mb-4">
            Box Details
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="slug" className="label">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-")
                  )
                }
                className="input-field"
              />
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  Link: {typeof window !== "undefined" ? window.location.origin : ""}/b/{slug}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[80px] resize-y"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPublished(!isPublished)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isPublished ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                {isPublished ? "Published" : "Draft"}
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveMetadata}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Details
                  </>
                )}
              </button>
              {isPublished && (
                <Link
                  href={`/b/${slug}`}
                  target="_blank"
                  className="btn-secondary"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              Sections & Products
            </h2>
            {availableEventTypes.length > 0 && (
              <div className="relative group">
                <button className="btn-secondary text-sm">
                  <Plus className="w-4 h-4" />
                  Add Section
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-border shadow-lg py-1 hidden group-hover:block z-10 min-w-[180px]">
                  {availableEventTypes.map((et) => (
                    <button
                      key={et.value}
                      onClick={() => handleAddSection(et.value)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2"
                    >
                      {EVENT_ICONS[et.value]}
                      {et.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(!box.sections || box.sections.length === 0) && (
            <div className="card p-8 text-center">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No sections yet. Add a Day, Night, or Party section to get
                started.
              </p>
            </div>
          )}

          {box.sections
            ?.sort((a, b) => a.sort_order - b.sort_order)
            .map((section) => {
              const etConfig = EVENT_TYPES.find(
                (e) => e.value === section.event_type
              );
              const isCollapsed = collapsedSections.has(section.id);
              const products = section.products || [];

              return (
                <div key={section.id} className="card mb-4">
                  {/* Section Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                          etConfig?.color || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {EVENT_ICONS[section.event_type]}
                        {etConfig?.label || section.event_type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {products.length} product{products.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Delete the ${etConfig?.label || section.event_type} section and all its products?`
                            )
                          ) {
                            handleDeleteSection(section.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Section Content */}
                  {!isCollapsed && (
                    <div className="px-4 pb-4 border-t border-border pt-4">
                      {products.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No products in this section yet.
                        </p>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {products
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group"
                              >
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-200 to-rose-300 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.brand}
                                    {product.price != null &&
                                      ` • $${Number(product.price).toFixed(2)}`}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    getStoreConfig(product.store).bg
                                  } ${getStoreConfig(product.store).text}`}
                                >
                                  {product.store}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      openProductForm(section.id, product)
                                    }
                                    className="p-1.5 rounded-lg hover:bg-white text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      <button
                        onClick={() => openProductForm(section.id)}
                        className="btn-secondary text-sm w-full"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowProductForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3
                id="product-form-title"
                className="font-display text-lg font-semibold"
              >
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="p-1.5 rounded-lg hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Product URL + Auto-fill (top of form for URL-first workflow) */}
              <div>
                <label htmlFor="purl" className="label">
                  Product URL
                </label>
                <div className="flex gap-2">
                  <input
                    id="purl"
                    type="url"
                    value={productForm.product_url}
                    onChange={(e) => {
                      setProductForm({
                        ...productForm,
                        product_url: e.target.value,
                      });
                      setScrapeError(null);
                    }}
                    className="input-field flex-1"
                    placeholder="https://www.sephora.com/product/..."
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={scraping || !productForm.product_url.trim()}
                    className="btn-secondary shrink-0 text-sm disabled:opacity-40"
                    title="Auto-fill product details from URL"
                  >
                    {scraping ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Auto-fill</span>
                      </>
                    )}
                  </button>
                </div>
                {scrapeError && (
                  <p className="text-sm text-red-500 mt-1">{scrapeError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pname" className="label">
                    Product Name *
                  </label>
                  <input
                    id="pname"
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Luminous Silk Foundation"
                  />
                </div>
                <div>
                  <label htmlFor="pbrand" className="label">
                    Brand *
                  </label>
                  <input
                    id="pbrand"
                    type="text"
                    value={productForm.brand}
                    onChange={(e) =>
                      setProductForm({ ...productForm, brand: e.target.value })
                    }
                    className="input-field"
                    placeholder="Giorgio Armani"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pcategory" className="label">
                    Category
                  </label>
                  <select
                    id="pcategory"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
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
                  <label htmlFor="pstore" className="label">
                    Store
                  </label>
                  <select
                    id="pstore"
                    value={productForm.store}
                    onChange={(e) =>
                      setProductForm({ ...productForm, store: e.target.value })
                    }
                    className="input-field"
                  >
                    {STORE_NAMES.map((store) => (
                      <option key={store} value={store}>
                        {store}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pprice" className="label">
                    Price
                  </label>
                  <input
                    id="pprice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    className="input-field"
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label htmlFor="pshade" className="label">
                    Shade / Variant
                  </label>
                  <input
                    id="pshade"
                    type="text"
                    value={productForm.shade}
                    onChange={(e) =>
                      setProductForm({ ...productForm, shade: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., #4 Light"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pimage" className="label">
                  Image URL
                </label>
                <input
                  id="pimage"
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image_url: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="https://..."
                />
                {productForm.image_url && (
                  <img
                    src={productForm.image_url}
                    alt="Preview"
                    className="mt-2 w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>

              <div>
                <label htmlFor="pinstructions" className="label">
                  Application Tips / Notes
                </label>
                <textarea
                  id="pinstructions"
                  value={productForm.instructions}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      instructions: e.target.value,
                    })
                  }
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Apply with a damp beauty sponge for the most natural finish..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-border">
              <button
                onClick={handleSaveProduct}
                disabled={
                  saving || !productForm.name.trim() || !productForm.brand.trim()
                }
                className="btn-primary"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingProduct ? "Update Product" : "Add Product"}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowProductForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
