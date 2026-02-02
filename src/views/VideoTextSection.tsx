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
      className="w-full min-h-screen bg-white py-12"
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 h-full">
          {/* Left column: Image with text and button */}
          <div
            className={`w-full lg:w-1/3 flex flex-col justify-center items-start gap-4 px-4 transform ${
              animate ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
            } transition-all duration-1000 ease-in-out`}
          >
            <span className="text-sm font-semibold text-rose-900">Curated Picks</span>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Handpicked for You
            </h3>
            <p className="text-gray-600 max-w-prose">
              Discover pieces chosen for their craftsmanship and style. From
              lightweight linens to embellished weaves — find something special
              for every moment.
            </p>

            <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
              <li>Artisan-made fabrics</li>
              <li>Limited runs</li>
              <li>Free express shipping</li>
            </ul>

            <button className="mt-4 px-5 py-2 bg-rose-900 text-white rounded shadow">
              Explore
            </button>
          </div>

          {/* Right column: Video */}
          <div
            className="w-full lg:w-1/3 h-full rounded overflow-hidden flex items-center justify-center"
            style={{ height: "100%" }}
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

          {/* Center: Highlighted Product */}
          <div
            className={`w-full lg:w-1/3 flex flex-col justify-center items-end gap-4 px-4 text-right transform ${
              animate ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
            } transition-all duration-1000 ease-in-out`}
          >
            <span className="text-sm font-semibold text-rose-600">Look Of The Week</span>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Elegant Sarees
            </h3>
            <p className="text-gray-600 max-w-prose">
              The moment I wore this saree, it felt special. The elegance, the
              fall, the richness of it — everything came together so effortlessly.
            </p>

            <button className="mt-2 text-base font-medium underline underline-offset-4 decoration-2 decoration-gray-900">
              Shop Now
            </button>

            <div className="mt-6 p-3 border border-gray-300 inline-block text-left">
              <Image
                src="/products/img5.jpeg"
                alt="Sample product"
                width={176}
                height={224}
                className="object-cover rounded"
              />

              <div className="mt-3 text-sm font-medium">ROOP SAREE - BEIGE & PINK</div>
              <div className="text-lg font-semibold">Rs.27,000</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}