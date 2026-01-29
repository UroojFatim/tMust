"use client";

import Image from "next/image";
import { FC, useMemo, useState } from "react";
import Link from "next/link";

const categoryLabel: Record<string, string> = {
  new_arrivals: "New Arrivals",
  best_sellers: "Best Sellers",
  casual_wears: "Casual",
  formal_wears: "Formal",
  fancy_party_wear: "Party",
  traditional_wear: "Traditional",
};

const colorClass: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border",
  navy: "bg-blue-900",
  gray: "bg-gray-400",
  pink: "bg-pink-300",
  red: "bg-red-500",
  blue: "bg-blue-500",
  beige: "bg-[#e7d3b1]",
};

const ProductCard: FC<{ item: any, linkTo?: string, onColorSelect?: () => void }> = ({ item, linkTo, onColorSelect }) => {
  const img0 = item?.images?.[0] ?? "";
  const img1 = item?.images?.[1] ?? null;
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const imageUrl = useMemo(() => {
    if (selectedColor) {
      const ci = (item?.colorImages || []).find((c: any) => c.color === selectedColor);
      if (ci) return ci.image;
    }
    if (hovered && img1) return img1;
    return img0 || "";
  }, [hovered, img0, img1, selectedColor, item]);

  return (
    <div
      className="group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-lg transition"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        {imageUrl && (
          <Link href={linkTo ?? '#'} className="block">
            <Image
              src={imageUrl}
              alt={item?.title || "Product"}
              fill
              className="object-cover object-top group-hover:scale-[1.03] transition duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>
        )}

        {/* Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur border">
            {categoryLabel[item?.category] ?? item?.category}
          </span>
        </div>

        {/* Quick meta strip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur border">
            {categoryLabel[item?.category] ?? (item?.category ?? "").replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">
            {item?.title}
          </h3>
          <p className="font-bold text-gray-900 whitespace-nowrap">
            ${item?.price}
          </p>
        </div>

          {/* color swatches (use color names) */}
          <div className="mt-3 flex items-center gap-3">
            {(item?.colors || []).map((c: string, idx: number) => {
              const ci = (item?.colorImages || []).find((x: any) => x.color === c);
              const selected = selectedColor === c;
              return (
                <button
                  key={c + idx}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedColor(c); onColorSelect?.(); }}
                  className={`flex items-center gap-2 px-2 py-1 rounded-full border transition-all ${selected ? 'ring-2 ring-brand-navy' : ''}`}
                  aria-label={`Select ${c}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full ${colorClass[c] ?? 'bg-gray-200'} border`} />
                  <span className="text-xs text-gray-700 capitalize">{c.replace(/_/g, ' ')}</span>
                </button>
              );
            })}
          </div>

        {/* sizes */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(item?.sizes || []).slice(0, 5).map((s: string, idx: number) => (
            <span
              key={idx}
              className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              {String(s).toUpperCase()}
            </span>
          ))}
          {(item?.sizes || []).length > 5 && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              +{(item.sizes.length as number) - 5}
            </span>
          )}
        </div>

        {/* small CTA removed; image opens detail page */}
      </div>
    </div>
  );
};

export default ProductCard;