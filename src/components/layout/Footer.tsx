import logo from "/public/MustLogo.png";
import React from "react";
import Image from "next/image";
import { Twitter, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const Footer = () => {
  return (
    <section className="mt-16 lg:mt-32">
      <div className="mx-auto mb-12 flex max-w-7xl flex-col gap-8 px-4 sm:mb-16 sm:gap-10 sm:px-6 md:mb-24 lg:mb-32 lg:flex-row lg:gap-16 lg:px-8">
        {/* Left Div */}
        <div className="w-full space-y-6 sm:space-y-8 lg:basis-1/3">
          <Image className="h-12 w-20" src={logo} alt="logo" />
          <p className="text-paragraph max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-xs xl:max-w-md 2xl:max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed">
            Small, artisan label that offers a thoughtfully curated collection
            of high quality everyday essentials made.
          </p>
          <div className="flex space-x-6 sm:space-x-9">
            <Twitter className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity" />
            <Facebook className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity" />
            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:opacity-70 transition-opacity" />
          </div>
        </div>
        {/* Right Div */}
        <div className="w-full grid grid-cols-1 gap-8 text-grey sm:grid-cols-2 sm:gap-10 lg:basis-2/3">
          <div>
            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl tracking-wide">
              Shop
            </h3>
            <button>
              <ul className="space-y-2 mt-4 lg:text-xl text-start">
                <li>New Arrivals</li>
                <li>Best Sellers</li>
              </ul>
            </button>
          </div>
          <div>
            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl tracking-wide">
              Subscribe to Newsletter
            </h3>
            <p className="text-sm sm:text-base mt-3 sm:mt-4 text-paragraph">
              Get the latest information and promo offers directly
            </p>
            <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
              <Input
                placeholder="Input email address"
                className="border-black border w-full min-w-0 sm:flex-1 py-4 px-4 rounded-none opacity-70 tracking-tighter text-sm"
              />
              <Button className="text-white px-8 py-4 w-full sm:w-auto whitespace-nowrap">
                Get Started
              </Button>
            </div>
          </div>
          {/* <div>
            <h3 className="font-bold text-xl lg:text-2xl tracking-wide">
              Contact
            </h3>
            <button>
              <ul className="space-y-2 mt-4 lg:text-xl text-start">
                <li>Whatsapp</li>
                <li>Support 24h</li>
              </ul>
            </button>
          </div> */}
        </div>
      </div>

      <div className="border-black border-t-[0.75px] w-full"></div>

      {/* Bottom */}
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-[#666] sm:flex-row sm:items-center sm:justify-between sm:py-5 lg:px-8">
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
