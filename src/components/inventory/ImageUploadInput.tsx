"use client";

import { useState } from "react";
import Image from "next/image";

type ImageUploadInputProps = {
  value?: string;
  onUpload: (url: string) => void;
};

export function ImageUploadInput({ value, onUpload }: ImageUploadInputProps) {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/inventory/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setUrl(data.url);
      onUpload(data.url);
      setMode("url");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = url || value;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 rounded px-2 py-1 text-xs font-semibold ${
            mode === "upload"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 text-slate-600"
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 rounded px-2 py-1 text-xs font-semibold ${
            mode === "url"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 text-slate-600"
          }`}
        >
          URL
        </button>
      </div>

      {mode === "upload" ? (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="w-full text-xs"
          />
          {uploading && <p className="mt-1 text-xs text-slate-500">Uploading...</p>}
        </div>
      ) : (
        <input
          type="text"
          placeholder="Image URL"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            onUpload(event.target.value);
          }}
          className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
        />
      )}

      {displayUrl && (
        <div className="mt-2">
          <Image
            src={displayUrl}
            alt="Preview"
            width={80}
            height={80}
            className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
          />
        </div>
      )}
    </div>
  );
}
