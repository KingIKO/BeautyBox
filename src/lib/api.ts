import { supabase } from "./supabase";
import type { Box, BoxSection, Product, ScrapedProduct } from "@/types";

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...(opts.headers as Record<string, string>),
  };
  // Don't set Content-Type for FormData
  if (opts.body instanceof FormData) {
    delete headers["Content-Type"];
  }
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Public ---
export const getBoxBySlug = (slug: string) =>
  apiFetch<Box>(`/api/boxes/${encodeURIComponent(slug)}`);

// --- Admin: Boxes ---
export const getAdminBoxes = () => apiFetch<Box[]>("/api/admin/boxes");

export const getAdminBox = (id: string) =>
  apiFetch<Box>(`/api/admin/boxes/${id}`);

export const createBox = (data: { title: string; description?: string }) =>
  apiFetch<Box>("/api/admin/boxes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateBox = (id: string, data: Partial<Box>) =>
  apiFetch<Box>(`/api/admin/boxes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteBox = (id: string) =>
  apiFetch<void>(`/api/admin/boxes/${id}`, { method: "DELETE" });

// --- Admin: Sections ---
export const addSection = (
  boxId: string,
  data: { event_type: string; description?: string; sort_order?: number }
) =>
  apiFetch<BoxSection>(`/api/admin/boxes/${boxId}/sections`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSection = (
  boxId: string,
  sectionId: string,
  data: { description?: string; sort_order?: number }
) =>
  apiFetch<BoxSection>(
    `/api/admin/boxes/${boxId}/sections/${sectionId}`,
    { method: "PUT", body: JSON.stringify(data) }
  );

export const deleteSection = (boxId: string, sectionId: string) =>
  apiFetch<void>(`/api/admin/boxes/${boxId}/sections/${sectionId}`, {
    method: "DELETE",
  });

// --- Admin: Products ---
export const addProduct = (
  boxId: string,
  data: Partial<Product> & { section_id: string; name: string; brand: string; category: string; store: string }
) =>
  apiFetch<Product>(`/api/admin/boxes/${boxId}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProduct = (id: string, data: Partial<Product>) =>
  apiFetch<Product>(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: string) =>
  apiFetch<void>(`/api/admin/products/${id}`, { method: "DELETE" });

// --- Admin: Image Upload ---
export const uploadProductImage = async (file: File): Promise<string> => {
  const headers = await authHeaders();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json();
  return url;
};

// --- Admin: Scrape URL ---
export const scrapeProductUrl = (url: string) =>
  apiFetch<ScrapedProduct>("/api/admin/scrape-url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });

// --- Admin: Reorder ---
export const reorderProducts = (
  items: { id: string; sort_order: number }[]
) =>
  apiFetch<void>("/api/admin/reorder", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
