import React from "react";
import Link from "next/link";
import AfsanaProduct from "../../public/homepage/afsanaproductshowcase.png";
import AfsanaDupattaShowcase from "../../public/homepage/afsanadupattashowcase.png";
import Image from "next/image";

const AfsanaShowcase = () => {
  return (
    <section className="bg-white py-10 sm:py-14 lg:py-20">
      <div className="mx-auto w-full max-w-screen-2xl px-5 sm:px-8 md:px-20 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#2b2623]">
                FEATURED PRODUCT
              </p>
              <h2 className="font-serif text-3xl leading-[1.1] text-[#5b3a31] sm:text-4xl lg:text-5xl">
                Afsana
              </h2>
              <p className="max-w-md text-sm leading-7 text-[#80726b] sm:text-base">
                Afsana is a Lorem ipsum dolor sit, amet consectetur adipisicing
                elit. Modi commodi fugit soluta libero quae, maiores porro sed,
                id, consectetur iste consequuntur perferendis nisi in ipsa
                quisquam enim atque vero hic.
              </p>
              <Link
                href="/product/afsana"
                className="inline-flex items-center gap-2 rounded-full border border-[#5b3a31] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b3a31] transition hover:bg-[#5b3a31] hover:text-white"
              >
                Shop Now
                <span aria-hidden className="text-base">→</span>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 bottom-0 h-28 w-12 bg-[#c87944] sm:-left-10 sm:h-36 sm:w-20 z-20" />
            <div className="relative overflow-hidden">
              <Image
                src={AfsanaProduct}
                alt="Model in red streetwear"
                className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[620px]"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center items-end gap-6">
            <div className="space-y-4">
              <div className="overflow-hidden">
                <Image
                  src={AfsanaDupattaShowcase}
                  alt="Editorial portrait"
                  className="h-[240px] w-full object-cover sm:h-[280px]"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#3f302a]">
                  With Printed Dupattas
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AfsanaShowcase;
