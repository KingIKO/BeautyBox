"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  baseUrl: string;
}

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}

export default function SlugInput({ value, onChange, baseUrl }: SlugInputProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = `${baseUrl}/b/${value}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(sanitizeSlug(e.target.value));
  };

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor="slug-input" className="label">
        Slug
      </label>
      <div className="flex gap-2">
        <input
          id="slug-input"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="my-box-name"
          className="input-field flex-1 font-mono text-sm"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="btn-secondary px-3 flex-shrink-0"
          aria-label="Copy share link"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {value && (
        <p className="text-xs text-muted-foreground font-mono truncate">
          {fullUrl}
        </p>
      )}
    </div>
  );
}
