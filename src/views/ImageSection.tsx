"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ImageSectionProps {
  desktopSrc: string;
  mobileSrc: string;
  alt?: string;
  collectionName: string;
  collectionSlug: string;
  shopNow?: boolean;
}

export default function ImageSection({
  desktopSrc,
  mobileSrc,
  alt = "Hero Image",
  collectionName,
  collectionSlug,
  shopNow = false,
}: ImageSectionProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Mobile */}
      {/* CHANGED: removed `priority` (this section is below the fold) so the image
          lazy-loads instead of being force-preloaded, and dropped quality 100 -> 70
          to cut delivered bytes. This is the main fix for the 28 MB payload /
          render-blocking preloads on the homepage. */}
      <Image
        src={mobileSrc}
        alt={alt}
        fill
        loading="lazy"
        sizes="100vw"
        quality={70}
        className="object-cover object-[center_30%] md:hidden block"
      />

      {/* Desktop */}
      <Image
        src={desktopSrc}
        alt={alt}
        fill
        loading="lazy"
        sizes="100vw"
        quality={70}
        className="object-cover object-[center_10%] hidden md:block"
      />

      {shopNow && (
        <div className="absolute inset-x-0 bottom-10 flex justify-center transition hover:translate-y-[-1px]">
          <div className="border-2 border-white">
            <Link
              href={`/collection/${collectionSlug}`}
              className="inline-flex items-center m-1 justify-center bg-black px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white "
              aria-label={`Shop ${collectionName}`}
            >
              Shop Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
