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
}

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
  const [styles, setStyles] = useState<StyleCardItem[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVideos, setShowVideos] = useState(false);
  const resumeTimer = useRef<number | null>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const readyVideoSlugs = useRef(new Set<string>());
  const [readyVideoCount, setReadyVideoCount] = useState(0);

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
    if (!collectionSlug) {
      return;
    }

    // Fetch styles for the collection
    const fetchStyles = async () => {
      try {
        setLoading(true);
        console.log("Fetching styles for collection:", collectionSlug);
        const response = await fetch(
          `/api/public/styles/collection/${collectionSlug}`,
        );
        const result = await response.json();

        console.log("Styles API Response:", result);

        if (result.ok && result.styles) {
          console.log(`Received ${result.styles.length} styles`);
          setStyles(result.styles);
          setShowVideos(false);
        } else {
          console.log("No styles found, will show videos instead");
          setStyles([]);
          setShowVideos(true);
        }
      } catch (error) {
        console.error("Error fetching styles:", error);
        setStyles([]);
        setShowVideos(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
  }, [collectionSlug]);

  const styleItems = useMemo<StyleCardItem[]>(() => {
    return styles;
  }, [styles]);

  const collectionVideoMap = useMemo(() => {
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
  }, []);

  useEffect(() => {
    readyVideoSlugs.current.clear();
    setReadyVideoCount(0);
  }, [styleItems.length, showVideos]);

  useEffect(() => {
    if (!styleItems.length) return;
    if (readyVideoCount < styleItems.length) return;

    const handle = window.requestAnimationFrame(() => {
      styleItems.forEach((item) => {
        const video = videoRefs.current.get(item.slug);
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
  }, [readyVideoCount, styleItems.length, styleItems]);

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

  if (!styleItems.length && !showVideos) {
    return (
      <div className="text-center py-8 text-gray-500">
        No content found for this collection.
      </div>
    );
  }

  // If showVideos is true but no styles found, display video carousel
  if (showVideos && !styleItems.length) {
    return (
      <section
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="overflow-hidden max-w-screen-2xl mx-auto">
          <div
            className="flex gap-0 transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(calc(-${index} * (100% / ${itemsToShow})))`,
            }}
          >
            {collectionStyleVideoFiles.map((file, i) => {
              const baseName = file.replace(/\.[^.]+$/, "");
              const name = baseName.replace(/video$/i, "");

              return (
                <div
                  key={file}
                  className="shrink-0 px-1 md:px-4 lg:px-5"
                  style={{ width: `calc(100% / ${itemsToShow})` }}
                >
                  <div className="group relative block h-full overflow-hidden border border-brand-sky_dark/60 bg-white shadow-sm">
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-sky_light">
                      <video
                        ref={(el) => {
                          if (!el) {
                            videoRefs.current.delete(file);
                            return;
                          }
                          videoRefs.current.set(file, el);
                        }}
                        src={`/collection-style-videos/${file}`}
                        className="w-full h-full object-cover object-top"
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="auto"
                        onCanPlay={() => {
                          if (readyVideoSlugs.current.has(file)) {
                            return;
                          }
                          readyVideoSlugs.current.add(file);
                          setReadyVideoCount(readyVideoSlugs.current.size);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-brand-navy/5 to-transparent opacity-0 transition group-hover:opacity-80" />
                    </div>

                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-black leading-snug">
                          {name}
                        </h3>
                      </div>

                      <div className="flex w-full items-center justify-between gap-2 bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-brand-sky_dark">
                        View collection
                        <span className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              const videoSrc = collectionVideoMap.get(item.slug);

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
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-sky_light flex items-center justify-center">
                      {videoSrc ? (
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
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-brand-navy/5 to-transparent opacity-0 transition group-hover:opacity-80" />
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-black leading-snug">
                          {item.name}
                        </h3>
                      </div>

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
