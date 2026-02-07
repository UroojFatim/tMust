"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
// Desktop images
import desktopHero1 from "../../public/hero/herosection.png";
import desktopHero2 from "../../public/hero/herosection2.png";
import desktopHero3 from "../../public/hero/herosection3.png";
// Mobile images
import mobileHero1 from "../../public/hero/heromobile.png";
import mobileHero2 from "../../public/hero/heromobile2.png";
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
    }, 5000);
    return () => clearInterval(t);
  }, [maxIndex]);

  return (
    <section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[calc(100vh-0px)] min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
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
                  className="object-cover object-center sm:object-top"
                  sizes="100vw"
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
