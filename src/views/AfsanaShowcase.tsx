"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AfsanaProduct from "../../public/homepage/afsanaproductshowcase.png";
import AfsanaDupattaShowcase from "../../public/homepage/afsanadupattashowcase.png";
import Image from "next/image";

const AfsanaShowcase = () => {
  return (
    <motion.section
      className="bg-white py-10 sm:py-14 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.15 },
        },
      }}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="flex flex-col justify-between gap-6"
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <div className="space-y-5">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#2b2623]">
                FEATURED PRODUCT
              </p>
              <motion.h2
                className="font-serif text-3xl leading-[1.1] text-[#5b3a31] sm:text-4xl lg:text-5xl"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
              >
                Afsana
              </motion.h2>
              <p className="max-w-md text-sm leading-7 text-[#80726b] sm:text-base">
                Afsana is a Lorem ipsum dolor sit, amet consectetur adipisicing
                elit. Modi commodi fugit soluta libero quae, maiores porro sed,
                id, consectetur iste consequuntur perferendis nisi in ipsa
                quisquam enim atque vero hic.
              </p>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
              >
                <Link
                  href="/product/afsana"
                  className="inline-flex items-center gap-2 rounded-full border border-[#5b3a31] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b3a31] transition hover:bg-[#5b3a31] hover:text-white"
                >
                  Shop Now
                  <span aria-hidden className="text-base">→</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            variants={{
              hidden: { opacity: 0, y: 28, scale: 0.98 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
            }}
          >
            <motion.div
              className="absolute -left-6 bottom-0 h-28 w-12 bg-[#c87944] sm:-left-10 sm:h-36 sm:w-20 z-20"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            />
            <motion.div
              className="relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <Image
                src={AfsanaProduct}
                alt="Model in red streetwear"
                className="h-[420px] w-full object-cover md:h-[800px] lg:h-[620px]"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col justify-center items-end gap-6"
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <div className="space-y-4">
              <motion.div
                className="overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <Image
                  src={AfsanaDupattaShowcase}
                  alt="Editorial portrait"
                  className="h-[240px] w-full object-cover sm:h-[280px]"
                />
              </motion.div>
              <div className="space-y-2">
                <motion.h3
                  className="text-sm font-semibold uppercase tracking-[0.08em] text-[#3f302a]"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                >
                  With Printed Dupattas
                </motion.h3>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AfsanaShowcase;
