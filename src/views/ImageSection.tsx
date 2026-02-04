'use client';

import React from 'react';
import Image from 'next/image';

interface ImageSectionProps {
  desktopSrc: string;
  mobileSrc: string;
  alt?: string;
}

export default function ImageSection({
  desktopSrc,
  mobileSrc,
  alt = 'Hero Image',
}: ImageSectionProps) {
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-screen min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
      
      {/* Mobile Image */}
      <Image
        src={mobileSrc}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center block md:hidden"
      />

      {/* Desktop Image */}
      <Image
        src={desktopSrc}
        alt={alt}
        fill
        priority
        sizes="100vh"
        className="object-cover object-center hidden md:block"
      />
    </div>
  );
}
