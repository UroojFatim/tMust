'use client';

import React from 'react';
import Image from 'next/image';

export default function ImageSection({ src }: { src: string }) {
  return (
    <div className="relative w-full h-screen">
      <Image
        src={src} // Using the passed image source here
        alt="Hero"
        fill
        className="object-cover object-left"
        priority
      />
    </div>
  );
}
