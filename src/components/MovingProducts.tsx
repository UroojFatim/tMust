/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/ProductCart";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

interface MovingProductsProps {
  collectionSlug: string;
}

export default function MovingProducts({ collectionSlug }: MovingProductsProps) {
  const [data, setData] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const resumeTimer = useRef<number | null>(null);

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
    // Fetch products from MongoDB based on collection slug
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products for collection:", collectionSlug);
        const response = await fetch(`/api/public/products/collection/${collectionSlug}`);
        const result = await response.json();
        
        console.log("API Response:", result);
        
        // Show debug info to understand database structure
        if (result.debug) {
          console.log("Products in database:", result.debug);
        }
        
        if (result.ok && result.products) {
          console.log(`Received ${result.products.length} products`);
          setData(result.products);
        } else {
          console.error("Failed to fetch products:", result.message);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (collectionSlug) {
      fetchProducts();
    }
  }, [collectionSlug]);

  const maxIndex = useMemo(() => {
    if (!data.length) return 0;
    return Math.max(0, data.length - itemsToShow);
  }, [data.length, itemsToShow]);

  // help TS accept extended ProductCard props
  const PC: any = ProductCard;

  // keep index in range when itemsToShow changes
  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (!data.length || paused) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(t);
  }, [data.length, paused, maxIndex]);

  // pause autoplay for a short time (ms)
  const pauseFor = (ms = 1500) => {
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

  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No products found for this collection.
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
      <div className="overflow-hidden">
        <div
          className="flex gap-0 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(calc(-${index} * (100% / ${itemsToShow})))`,
          }}
        >
          {data.map((item, i) => (
            <div
              key={item?.id ?? i}
              className="shrink-0 px-2"
              style={{ width: `calc(100% / ${itemsToShow})` }}
            >
              <PC item={item} linkTo={`/product/${item.slug}`} onColorSelect={() => pauseFor(1500)} />
            </div>
          ))}
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