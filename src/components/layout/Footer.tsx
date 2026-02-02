import logo from "/public/MustLogo.png";
import React from "react";
import Image from "next/image";
import { Twitter, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";
const Footer = () => {
  return (
    <section className="mt-16 sm:mt-24 md:mt-32 lg:mt-40">
      <div className="flex mb-12 sm:mb-16 md:mb-24 lg:mb-32 xl:mb-40 gap-y-8 sm:gap-y-10 gap-x-8 sm:gap-x-12 md:gap-x-16 lg:gap-x-24 lg:flex-row flex-col mx-4 px-4 sm:mx-6 sm:px-6 md:mx-10 md:px-10 xl:mx-16 xl:px-16">
        {/* Left Div */}
        <div className="lg:basis-1/3 space-y-6 sm:space-y-8 lg:space-y-8">
          <Image className="h-10 w-10 sm:h-12 sm:w-12" src={logo} alt="logo" />
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
        <div className="lg:basis-2/3 grid grid-cols-1 sm:grid-cols-2 gap-y-8 sm:gap-y-10 gap-x-8 sm:gap-x-12 md:gap-x-16 text-grey">
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
              Customer Service
            </h3>
            <button>
              <ul className="space-y-2 sm:space-y-2.5 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg xl:text-xl text-start">
                <li className="hover:text-black transition-colors">
                  Contact Us
                </li>
                <li className="hover:text-black transition-colors">
                  Shipping Information
                </li>
                <li className="hover:text-black transition-colors">
                  Return and Exchange
                </li>
                <li className="hover:text-black transition-colors">
                  Size Guide
                </li>
                <li className="hover:text-black transition-colors">
                  Track Order
                </li>
              </ul>
            </button>
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
      <div className="flex lg:flex-row flex-col justify-between gap-y-4 sm:gap-y-6 text-[#666] my-4 sm:my-5 lg:my-6 mx-4 px-4 sm:mx-6 sm:px-6 md:mx-10 md:px-10 xl:mx-16 xl:px-16">
        <div className="text-xs sm:text-sm md:text-base">
          Copyright © 2026 Must. All Rights Reserved.
        </div>
        {/* <div className="text-xs sm:text-sm md:text-base">
          Design by. <b className="text-black">xyz Design Studio</b>
        </div> */}
        <div className="text-xs sm:text-sm md:text-base">
          Powered by. <b className="text-black">EpicSphere</b>
        </div>
      </div>
    </section>
  );
};

export default Footer;
