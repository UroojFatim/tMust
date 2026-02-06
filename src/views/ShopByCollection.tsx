"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "@/components/shared/Wrapper";
import LoadingSpinner from "@/components/LoadingSpinner";

type CollectionItem = {
  _id?: string;
  name: string;
  slug: string;
};

type ProductItem = {
  collection?: string;
  collectionSlug?: string;
  variants?: Array<{
    images?: Array<{ url?: string }>;
  }>;
  images?: Array<{ url?: string }>;
};

type CollectionCard = {
  name: string;
  slug: string;
  imageUrl: string | null;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getProductImage = (product: ProductItem) =>
  product?.variants?.[0]?.images?.[0]?.url ||
  product?.images?.[0]?.url ||
  null;

export default function ShopByCollection() {
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [index, setIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsToShow(2);
      else if (w < 1024) setItemsToShow(4);
      else setItemsToShow(6);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [collectionsRes, productsRes] = await Promise.all([
          fetch("/api/public/collections"),
          fetch("/api/public/products"),
        ]);

        const collectionsData = await collectionsRes.json();
        const productsData = await productsRes.json();

        if (!collectionsData.ok || !productsData.ok) {
          setCollections([]);
          return;
        }

        const imageMap = new Map<string, string>();
        (productsData.products as ProductItem[]).forEach((product) => {
          const collectionSlug = product.collectionSlug ||
            (product.collection ? toSlug(product.collection) : "");
          if (!collectionSlug || imageMap.has(collectionSlug)) return;

          const imageUrl = getProductImage(product);
          if (imageUrl) {
            imageMap.set(collectionSlug, imageUrl);
          }
        });

        const cards = (collectionsData.collections as CollectionItem[]).map((collection) => {
          const slug = collection.slug || toSlug(collection.name);
          return {
            name: collection.name,
            slug,
            imageUrl: imageMap.get(slug) ?? null,
          };
        });

        setCollections(cards);
      } catch (error) {
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const maxIndex = useMemo(() => {
    if (!collections.length) return 0;
    return Math.max(0, collections.length - itemsToShow);
  }, [collections.length, itemsToShow]);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const prev = () => setIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  const next = () => setIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!collections.length) {
    return (
      <Wrapper>
        <section className="py-10">
          <div className="rounded-2xl border border-brand-sky_dark/40 bg-brand-sky_light px-6 py-10 text-center text-sm text-slate-600">
            No collections available right now.
          </div>
        </section>
      </Wrapper>
    );
  }

  return (
    <Wrapper noGutters>
      <section className="py-10">
        <div className="rounded-[32px] bg-[#f7f8fb] px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="shrink-0">
              <p className="text-[11px] font-PT_Serif tracking-[0.45em] text-brand-navy/80">
                SHOP BY COLLECTION
              </p>
            </div>

            <div className="relative flex-1">
              <button
                type="button"
                onClick={prev}
                disabled={collections.length <= itemsToShow}
                className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-sky_dark/60 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50 md:flex"
                aria-label="Previous collection"
              >
                <span aria-hidden>‹</span>
              </button>

              <div className="overflow-hidden px-0 md:px-12">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(calc(-${index} * (100% / ${itemsToShow})))`,
                  }}
                >
                  {collections.map((collection) => (
                    <Link
                      key={collection.slug}
                      href={`/collection/${collection.slug}`}
                      className="group flex shrink-0 flex-col items-center gap-4 px-3 text-center"
                      style={{ width: `calc(100% / ${itemsToShow})` }}
                    >
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/60 bg-white shadow-md ring-4 ring-white/70 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lg md:h-28 md:w-28 lg:h-32 lg:w-32">
                        {collection.imageUrl ? (
                          <Image
                            src={collection.imageUrl}
                            alt={collection.name}
                            fill
                            className="object-cover object-top transition duration-700 group-hover:scale-[1.06]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-sky_light via-white to-brand-sky text-xl font-semibold text-brand-navy">
                            {collection.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {collection.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={next}
                disabled={collections.length <= itemsToShow}
                className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-sky_dark/60 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50 md:flex"
                aria-label="Next collection"
              >
                <span aria-hidden>›</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
