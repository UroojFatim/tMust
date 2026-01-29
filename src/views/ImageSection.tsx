'use client';

import React from 'react';

export default function ImageSection({ src }: { src: string }) {
  return (
    <div className="relative w-full h-screen">
      <img
        src={src} // Using the passed image source here
        alt="Hero"
        className="w-full h-full object-cover object-left"
      />
    </div>
  );
}
