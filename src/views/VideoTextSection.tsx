"use client";

import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";

export default function VideoTextSection() {
  const [animate, setAnimate] = useState(false);

  // Trigger animation when section is in view
  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector("#video-text-section");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setAnimate(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="video-text-section"
      className="w-full min-h-screen bg-white py-8 sm:py-12 md:py-16 lg:py-12"
    >
      <div className="container mx-auto px-3 sm:px-4 h-full">
        <div className="flex flex-col lg:flex-row items-stretch gap-4 sm:gap-6 md:gap-8 h-full">
          {/* Left column: Image with text and button */}
          <div
            className={`w-full lg:w-1/3 flex flex-col justify-center items-start gap-3 sm:gap-4 px-2 sm:px-4 transform ${
              animate ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
            } transition-all duration-1000 ease-in-out`}
          >
            <span className="text-xs sm:text-sm font-semibold text-rose-900">Curated Picks</span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              Handpicked for You
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-prose leading-relaxed">
              Discover pieces chosen for their craftsmanship and style - Find something special
              for every moment.
            </p>

            <ul className="mt-2 sm:mt-3 list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1">
              <li>Pohnchos fabrics</li>
              <li>Multiple colors</li>
              <li>Free size</li>
            </ul>


          </div>

          {/* Center: Video */}
          <div
            className="w-full lg:w-1/3 h-full rounded overflow-hidden flex items-center justify-center"
          >
            <video
              src="/products/img12.mp4"
              className="w-full h-full object-cover rounded"
              muted
              playsInline
              autoPlay
              loop
            />
          </div>

          {/* Right: Highlighted Product */}
          <div
            className={`w-full lg:w-1/3 flex flex-col justify-center items-start lg:items-end gap-3 sm:gap-4 px-2 sm:px-4 text-left lg:text-right transform ${
              animate ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
            } transition-all duration-1000 ease-in-out`}
          >
            <span className="text-xs sm:text-sm font-semibold text-rose-600">Look Of The Week</span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              Satrangi Pohnchos
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-prose leading-relaxed">
              The moment I wore these, it felt special. The elegance, the
              fall, the richness of it — everything came together so effortlessly.
            </p>

            <button className="mt-2 text-sm sm:text-base font-medium underline underline-offset-4 decoration-2 decoration-gray-900 hover:text-gray-700 transition">
              Shop Now
            </button>

            <div className="mt-4 sm:mt-6 p-2 sm:p-3 border border-gray-300 inline-block text-left w-full lg:w-auto">
              <Image
                src="/products/img5.jpeg"
                alt="Sample product"
                width={176}
                height={224}
                className="object-cover rounded w-full h-auto lg:w-44"
              />

              <div className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium">SATRANGI POHNCHOS - BLACK</div>
              <div className="text-lg sm:text-xl font-semibold">175$</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}