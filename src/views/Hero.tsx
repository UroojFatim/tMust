"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import Wrapper from "@/components/shared/Wrapper";
import Link from "next/link";
import tMust2 from "../../public/hero_2.png";
import tMust3 from "../../public/hero_3.png";
import tMustHero from "../../public/hero_4.png";

const slides = [
  { src: tMust2, alt: "MUST collection slide 1" },
  { src: tMust3, alt: "MUST collection slide 2" },
  { src: tMustHero, alt: "MUST collection slide 3" },
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const maxIndex = useMemo(() => Math.max(0, slides.length - 1), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(t);
  }, [paused, maxIndex]);

  return (
    <section className="relative w-full h-[calc(100vh-0px)] min-h-[600px]">
      <div
        className="absolute inset-0 z-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="overflow-hidden h-full">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, slideIndex) => (
              <div
                key={slide.alt}
                className="relative h-full flex-[0_0_100%]"
                aria-label={`Slide ${slideIndex + 1}`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={slideIndex === 0}
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/80 via-white/40 to-white/10" /> */}

      {/* <div className="relative z-20 h-full">
        <Wrapper>
          <div className="flex h-full items-center py-20">
            <div className="max-w-xl">
              <Badge className="mt-6 py-1 px-5 rounded bg-brand-sky text-brand-navy font-semibold text-lg">
                Sale 70%
              </Badge>
              <h1 className="scroll-m-20 text-[52px] leading-none font-bold lg:text-6xl max-w-md 2xl:max-w-7xl opacity-90 mt-9">
                MUST COLLECTION
              </h1>
              <p className="text-[17px] max-w-sm 2xl:max-w-4xl text-gray-600 mt-6">
                Anyone can beat you but no one can beat your outfit as long as
                you wear MUST outfits.
              </p>
              <Link href={"/AllProducts"}>
                <Button className="mt-8 bg-brand-navy 2xl:text-lg text-white font-bold py-6 px-20 md:py-7 md:px-[40px] 2xl:py-7 gap-x-3 border-none rounded-xl">
                  <ShoppingCart className="2xl:h-7 2xl:w-7 h-6 w-6" />
                  <span>Start Shopping</span>
                </Button>
              </Link>
            </div>
          </div>
        </Wrapper>
      </div> */}
    </section>
  );
};

export default Hero;
