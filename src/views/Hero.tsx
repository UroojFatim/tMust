"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
// Desktop images
import desktopHero1 from "../../public/hero/hero_desktop_1.png";
import desktopHero2 from "../../public/hero/hero_desktop_2.png";
import desktopHero3 from "../../public/hero/hero_desktop_3.png";
// Mobile images
import mobileHero1 from "../../public/hero/hero_mobile_1.png";
import mobileHero2 from "../../public/hero/hero_mobile_2.png";
import mobileHero3 from "../../public/hero/hero_mobile_3.png";

const desktopSlides = [
  { src: desktopHero1, alt: "MUST collection slide 1" },
  { src: desktopHero2, alt: "MUST collection slide 2" },
  { src: desktopHero3, alt: "MUST collection slide 3" },
];

const mobileSlides = [
  { src: mobileHero1, alt: "MUST collection slide 1" },
  { src: mobileHero2, alt: "MUST collection slide 2" },
  { src: mobileHero3, alt: "MUST collection slide 3" },
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const slides = isMobile ? mobileSlides : desktopSlides;
  const maxIndex = useMemo(() => Math.max(0, slides.length - 1), [slides]);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(t);
  }, [maxIndex]);

  const goToSlide = (nextIndex: number) => {
    if (maxIndex === 0) {
      return;
    }
    setIndex(nextIndex);
  };

  const goPrev = () => {
    if (maxIndex === 0) {
      return;
    }
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goNext = () => {
    if (maxIndex === 0) {
      return;
    }
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full h-screen min-h-[520px] md:min-h-[650px]">
      <div className="absolute inset-0 z-0">
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
                  className="object-cover object-top md:object-top"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-y-0 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={goPrev}
          className="pointer-events-auto h-9 w-9 rounded-full border border-white/70 bg-black/30 text-white transition hover:bg-black/50"
          aria-label="Previous slide"
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          className="pointer-events-auto h-9 w-9 rounded-full border border-white/70 bg-black/30 text-white transition hover:bg-black/50"
          aria-label="Next slide"
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2">
        {slides.map((slide, slideIndex) => (
          <button
            key={`${slide.alt}-dot`}
            type="button"
            onClick={() => goToSlide(slideIndex)}
            className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
              slideIndex === index
                ? "bg-white border-white scale-110"
                : "bg-transparent border-white/70 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${slideIndex + 1}`}
            aria-current={slideIndex === index}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
