"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Collections() {
  const [collections, setCollections] = useState([]);

  const imageUrls = [
    "/collections/luxury.png",
    "/collections/semiformal.png",
    "/collections/Ethnic.png",
    "/collections/smartcasual.png",
  ];

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetch("/api/public/collections", {
          cache: "no-store",
        });
        const data = await response.json();
        if (data?.ok && Array.isArray(data.collections)) {
          setCollections(
            data.collections
              .map((collection) => ({
                title: collection?.name,
                slug: collection?.slug,
              }))
              .filter((collection) => collection.title && collection.slug)
          );
        }
      } catch (error) {
        console.error("Failed to load collections", error);
      }
    };

    loadCollections();
  }, []);

  const items = collections
    .slice(0, imageUrls.length)
    .map((title, index) => ({
      ...title,
      image: imageUrls[index],
    }));

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}   // 🔁 animate every time
          className="font-PT_Serif text-3xl md:text-4xl font-semibold mb-12"
        >
          SHOP BY COLLECTIONS
        </motion.h2>

        {/* Circles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 place-items-center">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15, // stagger
              }}
              viewport={{ once: false, amount: 0.3 }}   // 🔁 animate every time
              className="flex flex-col items-center"
            >
              {/* Circle Image */}
              <Link href={`/collection/${item.slug}`} className="group">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-gray-200 shadow-md"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={160}
                    height={160}
                    sizes="(max-width: 768px) 144px, 260px"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              </Link>

              {/* Title */}
              <Link
                href={`/collection/${item.slug}`}
                className="mt-4 text-sm md:text-base font-medium transition group-hover:opacity-80"
              >
                {item.title}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
