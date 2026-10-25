"use client";

import Link from "next/link";

export default function UnderConstruction() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
      
      <div className="text-center max-w-xl">
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-semibold mb-6">
          🚧 Under Construction
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8">
         We’re polishing this experience and adding the finishing touches. Please check back soon — it’ll be worth it.
        </p>

        {/* Animated Loader */}
         <div className="mt-10 flex justify-center">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border border-neutral-200" />
                  <div className="absolute inset-0 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-neutral-900">
                    Building…
                  </div>
                  <div className="text-sm text-neutral-500">
                    Please refresh later
                  </div>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
}
