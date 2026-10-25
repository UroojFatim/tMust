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

// CHANGED: pair mobile + desktop per slide so the carousel index stays the same
// but the browser only downloads the image that matches the viewport (via CSS),
// instead of detecting mobile in JS after mount (which delayed the LCP and
// briefly loaded the 2 MB desktop image on phones).
const slides = [
  { desktop: desktopHero1, mobile: mobileHero1, alt: "MUST collection slide 1" },
  { desktop: desktopHero2, mobile: mobileHero2, alt: "MUST collection slide 2" },
  { desktop: desktopHero3, mobile: mobileHero3, alt: "MUST collection slide 3" },
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const maxIndex = useMemo(() => Math.max(0, slides.length - 1), []);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(t);
  }, [maxIndex]);

  const goToSlide = (nextIndex: number) => {
    if (maxIndex === 0) return;
    setIndex(nextIndex);
  };

  const goPrev = () => {
    if (maxIndex === 0) return;
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goNext = () => {
    if (maxIndex === 0) return;
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section
      className="relative w-full h-screen md:h-full md:min-h-[800px]"
      aria-label="Featured collections"
    >
      {/* CHANGED: page needs a single top-level h1 for a well-formed heading
          outline (a11y tree + agentic browsing); kept visually hidden. */}
      <h1 className="sr-only">
        MUST — Luxury, Ethnic &amp; Signature Clothing Collections
      </h1>
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
                {/* Mobile image — slide 0 is preloaded (fast mobile LCP + good
                    "LCP request discovery"); the desktop variant stays lazy so a
                    phone never downloads the 2 MB desktop PNG. */}
                <Image
                  src={slide.mobile}
                  alt={slide.alt}
                  fill
                  priority={slideIndex === 0}
                  className="object-cover object-top md:hidden"
                  sizes="100vw"
                />
                {/* Desktop image — lazy: when hidden (display:none on mobile) the
                    browser skips it entirely; when visible on desktop it loads
                    immediately because it is already in the viewport. */}
                <Image
                  src={slide.desktop}
                  alt={slide.alt}
                  fill
                  loading="lazy"
                  className="hidden object-cover object-top md:block"
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
          className="pointer-events-auto h-11 w-11 rounded-full border border-white/70 bg-black/40 text-white transition hover:bg-black/60"
          aria-label="Previous slide"
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          className="pointer-events-auto h-11 w-11 rounded-full border border-white/70 bg-black/40 text-white transition hover:bg-black/60"
          aria-label="Next slide"
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-1">
        {slides.map((slide, slideIndex) => (
          // CHANGED: 44x44 tappable area for the touch-target audit; visible dot is the inner span
          <button
            key={`${slide.alt}-dot`}
            type="button"
            onClick={() => goToSlide(slideIndex)}
            className="flex h-11 w-11 items-center justify-center"
            aria-label={`Go to slide ${slideIndex + 1}`}
            aria-current={slideIndex === index}
          >
            {/* CHANGED: transition only `transform` (composited) — no border-color
                / width animation — to clear the non-composited-animations audit */}
            <span
              className={`block h-2.5 w-2.5 rounded-full border border-white/80 transition-transform duration-300 ${
                slideIndex === index ? "bg-white scale-125" : "bg-white/30"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
