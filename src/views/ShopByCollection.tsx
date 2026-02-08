"use client";

import { useEffect, useState } from "react";
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
  product?.variants?.[0]?.images?.[0]?.url || product?.images?.[0]?.url || null;

export default function ShopByCollection() {
  const [collections, setCollections] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);

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
          const collectionSlug =
            product.collectionSlug ||
            (product.collection ? toSlug(product.collection) : "");
          if (!collectionSlug || imageMap.has(collectionSlug)) return;

          const imageUrl = getProductImage(product);
          if (imageUrl) {
            imageMap.set(collectionSlug, imageUrl);
          }
        });

        const cards = (collectionsData.collections as CollectionItem[]).map(
          (collection) => {
            const slug = collection.slug || toSlug(collection.name);
            return {
              name: collection.name,
              slug,
              imageUrl: imageMap.get(slug) ?? null,
            };
          },
        );

        setCollections(cards);
      } catch (error) {
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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

  const displayCollections = collections.map((collection, index) =>
    index === collections.length - 1
      ? { ...collection, imageUrl: "/homepage/afsanaproductshowcase.png" }
      : collection
  );

  return (
    <Wrapper noGutters>
      <section className="py-10">
        <div className="rounded-[32px] px-6 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="shrink-0 lg:w-64">
              <p className="text-xl font-PT_Serif tracking-widest sm:text-2xl">
                SHOP BY COLLECTION
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8">
              {displayCollections.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/collection/${collection.slug}`}
                  className="group flex flex-col items-center gap-4 text-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/60 bg-white shadow-md ring-4 ring-white/70 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lg md:h-32 md:w-32 lg:h-40 lg:w-40">
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.name}
                        fill
                        className="object-cover object-top transition duration-700 group-hover:scale-[1.06]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
        </div>
      </section>
    </Wrapper>
  );
}
