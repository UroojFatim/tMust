'use client';

import React from 'react';
import Image from 'next/image';

export default function ImageSection({ src }: { src: string }) {
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-screen min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
      <Image
        src={src} // Using the passed image source here
        alt="Hero"
        fill
        className="object-cover object-center sm:object-left"
        priority
        sizes="100vw"
      />
    </div>
  );
}
