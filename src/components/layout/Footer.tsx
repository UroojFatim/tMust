import logo from "/public/MustLogo.png";
import React from "react";
import Image from "next/image";
import { Twitter, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const Footer = () => {
  return (
    <section className="mt-10 sm:mt-16">
      <div className="mx-auto mb-12 sm:mb-16 md:mb-24 lg:mb-32 flex flex-col lg:flex-row max-w-screen-2xl gap-8 lg:gap-16 px-6 md:px-10 lg:px-12">
        {/* Left Div */}
        <div className="w-full space-y-6 sm:space-y-8 lg:basis-1/2">
          <Image className="h-12 w-20" src={logo} alt="logo" />
          <p className="text-paragraph max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-xs xl:max-w-md 2xl:max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed">
            Small, artisan label that offers a thoughtfully curated collection
            of high quality everyday essentials made.
          </p>
        </div>
        {/* Right Div */}
        <div className="w-full grid grid-cols-1 text-grey lg:basis-1/2">
          <h3 className="font-bold text-lg sm:text-xl lg:text-2xl tracking-wide">
            Socials
          </h3>
          <div className="flex space-x-6 sm:space-x-9">
            <Twitter className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity" />
            <Facebook className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity" />
            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>

      <div className="border-black border-t-[0.75px] w-full"></div>

      {/* Bottom */}
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-6 md:px-10 py-4 text-[#666] sm:flex-row sm:items-center sm:justify-between sm:py-5 lg:px-8">
        <div className="text-xs sm:text-sm md:text-base">
          Copyright © 2026 Must. All Rights Reserved.
        </div>
        {/* <div className="text-xs sm:text-sm md:text-base">
          Design by. <b className="text-black">xyz Design Studio</b>
        </div> */}
        <div className="text-xs sm:text-sm md:text-base">
          Powered by.{" "}
          <b className="text-black">
            {" "}
            <a
              href="https://www.epic-sphere.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Epic Sphere
            </a>
          </b>
        </div>
      </div>
    </section>
  );
};

export default Footer;
