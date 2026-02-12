"use client";

import Image from "next/image";
import { FC, useMemo, useState } from "react";
import Link from "next/link";

const colorClass: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border",
  navy: "bg-blue-900",
  "navy blue": "bg-blue-900",
  gray: "bg-gray-400",
  grey: "bg-gray-400",
  pink: "bg-pink-300",
  "shocking pink": "bg-pink-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  "light blue": "bg-blue-300",
  "dark blue": "bg-blue-800",
  beige: "bg-[#e7d3b1]",
  brown: "bg-amber-700",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  maroon: "bg-red-900",
  "dark brown": "bg-amber-900",
  green: "bg-green-500",
  "dark green": "bg-green-800",
  "mehndi green": "bg-emerald-700",
  purple: "bg-purple-500",
  magenta: "bg-fuchsia-500",
  "aqua blue": "bg-cyan-400",
  teal: "bg-teal-600",
  "light teal": "bg-teal-300",
  "blue/green": "bg-emerald-500",
  gold: "bg-yellow-600",
  peach: "bg-orange-300",
  mustard: "bg-yellow-700",
  "black/silver": "bg-gray-800",
  "red and black": "bg-red-700",
  "black floral": "bg-gray-900",
};

const ProductCard: FC<{
  item: any;
  linkTo?: string;
  onColorSelect?: () => void;
}> = ({ item, linkTo, onColorSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Extract data from MongoDB product structure
  const variants = useMemo(() => item?.variants || [], [item?.variants]);
  const firstVariant = variants[0];

  // Get all unique colors from variants
  const colors = useMemo(() => {
    return variants.map((v: any) => v.color).filter(Boolean);
  }, [variants]);

  // Get all unique sizes from all variants
  const sizes = useMemo(() => {
    const sizeSet = new Set<string>();
    variants.forEach((variant: any) => {
      (variant.sizes || []).forEach((s: any) => {
        if (s.size) sizeSet.add(s.size);
      });
    });
    return Array.from(sizeSet);
  }, [variants]);

  // Get current variant based on selected color or first variant
  const currentVariant = useMemo(() => {
    if (selectedColor) {
      return (
        variants.find(
          (v: any) => v.color?.toLowerCase() === selectedColor.toLowerCase(),
        ) || firstVariant
      );
    }
    return firstVariant;
  }, [selectedColor, variants, firstVariant]);

  // Get images for current variant
  const currentImages = currentVariant?.images || [];
  const img0 = currentImages[0]?.url || "";
  const img1 = currentImages[1]?.url || null;

  const imageUrl = useMemo(() => {
    if (hovered && img1) return img1;
    return img0 || "";
  }, [hovered, img0, img1]);

  return (
    <Link
      href={linkTo ?? "#"}
      className="block group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-lg transition"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item?.title || "Product"}
            fill
            className="object-cover object-top group-hover:scale-[1.03] transition duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Badge */}
        {item?.tags && item.tags.length > 0 && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur border">
              {item.tags[0]}
            </span>
          </div>
        )}

        {/* Style label at bottom */}
        {item?.style && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur border">
              {item.style}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">
            {item?.title}
          </h3>
          <p className="font-bold text-gray-900 whitespace-nowrap">
            ${item?.basePrice}
          </p>
        </div>

        {/* color swatches */}
        {colors.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {colors.map((color: string, idx: number) => {
              const selected =
                selectedColor?.toLowerCase() === color?.toLowerCase();
              const normalizedColor = color.toLowerCase().replace(/\s+/g, " ");
              return (
                <button
                  key={color + idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedColor(color);
                    onColorSelect?.();
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${selected ? "ring-2 ring-gray-900" : ""}`}
                  aria-label={`Select ${color}`}
                  title={color}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full ${colorClass[normalizedColor] ?? "bg-gray-200"} border`}
                  />
                  <span className="text-xs text-gray-700 capitalize">
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* sizes */}
        {sizes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.slice(0, 5).map((size: string, idx: number) => (
              <span
                key={idx}
                className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700"
              >
                {String(size).toUpperCase()}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                +{sizes.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
