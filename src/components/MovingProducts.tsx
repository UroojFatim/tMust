/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

interface MovingProductsProps {
  collectionSlug: string;
  initialProducts?: any[];
}

interface StyleCardItem {
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
  colors: string[];
}

const colorClass: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border",
  navy: "bg-blue-900",
  gray: "bg-gray-400",
  pink: "bg-pink-300",
  red: "bg-red-500",
  blue: "bg-blue-500",
  beige: "bg-[#e7d3b1]",
  brown: "bg-amber-700",
  orange: "bg-orange-500",
  "dark brown": "bg-amber-900",
};

const collectionStyleVideoFiles = [
  "Meherbanvideo.mp4",
  "Noorezarivideo.mp4",
  "Rangrezavideo.mp4",
  "Riwayatvideo.mp4",
  "Satrangivideo.mp4",
  "Shahkarvideo.mp4",
  "Tajdarvideo.mp4",
  "Zarposhvideo.mp4",
];

const styleVideoOverrides: Record<string, string> = {
  "meherban": "Meherbanvideo.mp4",
  "noor-e-zari": "Noorezarivideo.mp4",
  "noorezari": "Noorezarivideo.mp4",
  "shahkar": "Shahkarvideo.mp4",
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function MovingProducts({
  collectionSlug,
  initialProducts,
}: MovingProductsProps) {
  const hasInitialProducts = Array.isArray(initialProducts);
  const [products, setProducts] = useState<any[]>(
    hasInitialProducts ? initialProducts : [],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(!hasInitialProducts);
  const resumeTimer = useRef<number | null>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const readyVideoSlugs = useRef(new Set<string>());
  const [readyVideoCount, setReadyVideoCount] = useState(0);

  const useCollectionVideos =
    collectionSlug === "ethnic-collection" ||
    collectionSlug === "luxury-collection";

  // responsive items count
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsToShow(1);
      else if (w < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (hasInitialProducts || !collectionSlug) {
      return;
    }

    // Fetch products from MongoDB based on collection slug
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products for collection:", collectionSlug);
        const response = await fetch(
          `/api/public/products/collection/${collectionSlug}`,
        );
        const result = await response.json();

        console.log("API Response:", result);

        // Show debug info to understand database structure
        if (result.debug) {
          console.log("Products in database:", result.debug);
        }

        if (result.ok && result.products) {
          console.log(`Received ${result.products.length} products`);
          setProducts(result.products);
        } else {
          console.error("Failed to fetch products:", result.message);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collectionSlug, hasInitialProducts]);

  const styleItems = useMemo<StyleCardItem[]>(() => {
    if (!products.length) return [];
    const map = new Map<string, StyleCardItem>();

    products.forEach((product) => {
      const styleName =
        typeof product?.style === "string"
          ? product.style
          : Array.isArray(product?.style)
            ? product.style[0]
            : "";
      const slug = product?.styleSlug || (styleName ? toSlug(styleName) : "");

      if (!styleName || !slug) return;

      const imageUrl =
        product?.variants?.[0]?.images?.[0]?.url ||
        product?.images?.[0]?.url ||
        null;

      const existing = map.get(slug) ?? {
        name: styleName,
        slug,
        imageUrl,
        productCount: 0,
        colors: [] as string[],
      };

      existing.productCount += 1;

      if (!existing.imageUrl && imageUrl) {
        existing.imageUrl = imageUrl;
      }

      const colors: string[] = (product?.variants || [])
        .map((variant: any) => variant?.color)
        .filter(Boolean)
        .map((color: string) => color.toLowerCase().trim());

      colors.forEach((color) => {
        if (!existing.colors.includes(color)) {
          existing.colors.push(color);
        }
      });

      map.set(slug, existing);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products]);

  const collectionVideoMap = useMemo(() => {
    if (!useCollectionVideos) return new Map<string, string>();
    const map = new Map<string, string>();

    Object.entries(styleVideoOverrides).forEach(([slug, file]) => {
      map.set(slug, `/collection-style-videos/${file}`);
    });

    collectionStyleVideoFiles.forEach((file) => {
      const baseName = file.replace(/\.[^.]+$/, "");
      const name = baseName.replace(/video$/i, "");
      const slug = toSlug(name);
      if (!map.has(slug)) {
        map.set(slug, `/collection-style-videos/${file}`);
      }
    });
    return map;
  }, [useCollectionVideos]);

  const videoSlugs = useMemo(() => {
    if (!useCollectionVideos) return [] as string[];
    return styleItems
      .map((item) => item.slug)
      .filter((slug) => collectionVideoMap.has(slug));
  }, [styleItems, collectionVideoMap, useCollectionVideos]);

  const totalVideoCount = videoSlugs.length;

  useEffect(() => {
    readyVideoSlugs.current.clear();
    setReadyVideoCount(0);
  }, [totalVideoCount, styleItems.length, useCollectionVideos]);

  useEffect(() => {
    if (!useCollectionVideos || totalVideoCount === 0) return;
    if (readyVideoCount < totalVideoCount) return;

    const handle = window.requestAnimationFrame(() => {
      videoSlugs.forEach((slug) => {
        const video = videoRefs.current.get(slug);
        if (!video) return;
        try {
          video.currentTime = 0;
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } catch {
          // Ignore autoplay timing errors.
        }
      });
    });

    return () => window.cancelAnimationFrame(handle);
  }, [readyVideoCount, totalVideoCount, useCollectionVideos, videoSlugs]);

  const maxIndex = useMemo(() => {
    if (!styleItems.length) return 0;
    return Math.max(0, styleItems.length - itemsToShow);
  }, [styleItems.length, itemsToShow]);

  // keep index in range when itemsToShow changes
  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (!styleItems.length || paused) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(t);
  }, [styleItems.length, paused, maxIndex]);

  // pause autoplay for a short time (ms)
  const pauseFor = (ms = 5000) => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      setPaused(false);
      resumeTimer.current = null;
    }, ms) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const prev = () => setIndex((p) => (p <= 0 ? maxIndex : p - 1));
  const next = () => setIndex((p) => (p >= maxIndex ? 0 : p + 1));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!styleItems.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No styles found for this collection.
      </div>
    );
  }

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* controls removed per request */}

      {/* viewport */}
      <div className="overflow-hidden max-w-screen-2xl mx-auto">
        <div
          className="flex gap-0 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(calc(-${index} * (100% / ${itemsToShow})))`,
          }}
        >
          {styleItems.map((item, i) =>
            (() => {
              const videoSrc = useCollectionVideos
                ? collectionVideoMap.get(item.slug)
                : undefined;
              const showVideo = Boolean(videoSrc || item.imageUrl);

              return (
                <div
                  key={item?.slug ?? i}
                  className="shrink-0 px-1 md:px-4 lg:px-5"
                  style={{ width: `calc(100% / ${itemsToShow})` }}
                >
                  <Link
                    href={`/style/${item.slug}`}
                    className="group relative block h-full overflow-hidden border border-brand-sky_dark/60 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                    onClick={() => pauseFor(1500)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-sky_light">
                      {showVideo ? (
                        // <Image
                        //   src={item.imageUrl}
                        //   alt={`${item.name} style`}
                        //   fill
                        //   className="object-cover object-top transition duration-700 group-hover:scale-[1.05]"
                        //   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        // />
                        videoSrc ? (
                          <video
                            ref={(el) => {
                              if (!el) {
                                videoRefs.current.delete(item.slug);
                                return;
                              }
                              videoRefs.current.set(item.slug, el);
                            }}
                            src={videoSrc}
                            className="w-full h-full object-cover object-top"
                            muted
                            playsInline
                            autoPlay
                            loop
                            preload="auto"
                            onCanPlay={() => {
                              if (readyVideoSlugs.current.has(item.slug)) {
                                return;
                              }
                              readyVideoSlugs.current.add(item.slug);
                              setReadyVideoCount(readyVideoSlugs.current.size);
                            }}
                          />
                        ) : (
                          <video
                            src="/products/satrangi.mp4"
                            className="w-full h-full object-cover object-top"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        )
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                          Style preview coming soon
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-brand-navy/5 to-transparent opacity-0 transition group-hover:opacity-80" />
                      {/* <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-navy backdrop-blur">
                    Style
                  </div> */}
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-black leading-snug">
                          {item.name}
                        </h3>
                        <span className="rounded-full border border-brand-sky_dark/60 bg-brand-sky_light px-2.5 py-1 text-xs font-semibold text-brand-navy">
                          {item.productCount} items
                        </span>
                      </div>

                      {/* {item.colors.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {item.colors.slice(0, 5).map((color, colorIndex) => {
                        const normalizedColor = color.replace(/\s+/g, " ");
                        return (
                          <span
                            key={`${item.slug}-${color}-${colorIndex}`}
                            className={`h-3 w-3 rounded-full border ${
                              colorClass[normalizedColor] ?? "bg-slate-200"
                            }`}
                            title={color}
                          />
                        );
                      })}
                      {item.colors.length > 5 && (
                        <span className="text-xs font-semibold text-slate-500">
                          +{item.colors.length - 5}
                        </span>
                      )}
                    </div>
                  )} */}

                      {/* <p className="text-sm text-slate-600 line-clamp-2">
                    Explore {item.name} pieces curated for this collection.
                  </p> */}

                      <div className="flex w-full items-center justify-between gap-2 bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-brand-sky_dark">
                        Explore style
                        <span className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })(),
          )}
        </div>
      </div>

      {/* dots */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-8 bg-brand-navy" : "w-2 bg-gray-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
