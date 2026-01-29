"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import tMust2 from "../../public/hero_5.png";
import tMust3 from "../../public/hero_3.png";
import tMustHero from "../../public/hero_4.png";

const slides = [
  { src: tMust2, alt: "MUST collection slide 1" },
  { src: tMust3, alt: "MUST collection slide 2" },
  { src: tMustHero, alt: "MUST collection slide 3" },
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const maxIndex = useMemo(() => Math.max(0, slides.length - 1), []);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(t);
  }, [ maxIndex]);

  return (
    <section className="relative w-full h-[calc(100vh-0px)] min-h-[600px]">
      <div
        className="absolute inset-0 z-0"
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
    </section>
  );
};

export default Hero;
