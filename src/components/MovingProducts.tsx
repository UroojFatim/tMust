/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/ProductCart";
import FetchData from "../../sanity/FetchData";
import Link from "next/link";

export default function MovingProducts() {
  const [data, setData] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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
    async function fetchData() {
      const productData = await FetchData();
      console.log("Fetched products:", productData);
      setData(productData || []);
    }
    fetchData();
  }, []);

  const maxIndex = useMemo(() => {
    if (!data.length) return 0;
    return Math.max(0, data.length - itemsToShow);
  }, [data.length, itemsToShow]);

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

  const prev = () => setIndex((p) => (p <= 0 ? maxIndex : p - 1));
  const next = () => setIndex((p) => (p >= maxIndex ? 0 : p + 1));

  if (!data.length) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading products...
      </div>
    );
  }

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* controls */}
      <button
        onClick={prev}
        className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-md border hover:scale-105 transition"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-md border hover:scale-105 transition"
        aria-label="Next"
      >
        ›
      </button>

      {/* viewport */}
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(calc(-${index} * (100% / ${itemsToShow})))`,
          }}
        >
          {data.map((item, i) => (
            <div
              key={item?._id ?? i}
              className="shrink-0"
              style={{ width: `calc(100% / ${itemsToShow})` }}
            >
              <Link href={`/product/${item.slug.current}`} className="block">
                <ProductCard item={item} />
              </Link>
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