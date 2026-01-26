import logo from "/public/MustLogo.png";
import React from "react";
import Image from "next/image";
import { Twitter, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";
const Footer = () => {
  return (
    <section className="mt-40">
      <div className="flex mb-16 lg:mb-40 gap-y-10 gap-x-24 lg:flex-row flex-col mx-4 px-4 md:mx-10 md:px-10 xl:mx-16 xl:px-16">
        {/* Left Div */}
        <div className="basis-1/3 space-y-10 lg:space-y-8">
          <Image className="scale-135 ml-6 h-12 w-12" src={logo} alt="logo" />
          <p className="text-paragraph w-52 lg:w-72 xl:w-96 2xl:w-[800px] lg:text-lg">
            Small, artisan label that offers a thoughtfully curated collection
            of high quality everyday essentials made.
          </p>
          <div className="flex space-x-9">
            <Twitter />
            <Facebook />
            <Linkedin />
          </div>
        </div>
        {/* Right Div */}
        <div className="basis-2/3 grid grid-cols-1 lg:grid-cols-2 gap-y-10 text-grey">
          <div>
            <h3 className="font-bold text-xl lg:text-2xl tracking-wide">
              Shop
            </h3>
            <button>
              <ul className="space-y-2 mt-4 lg:text-xl text-start">
                <li>Mew Arrivals</li>
                <li>Best Sellers</li>
                <li>Casual Wears</li>
                <li>Formal Wears</li>
                <li>Traditional Wears</li>
              </ul>
            </button>
          </div>
          <div>
            <h3 className="font-bold text-xl lg:text-2xl tracking-wide">
              Customer Service
            </h3>
            <button>
              <ul className="space-y-2 mt-4 lg:text-xl text-start">
                <li>Contact Us</li>
                <li>Shipping Information</li>
                <li>Return and Exchange</li>
                <li>Size Guide</li>
                <li>Track Order</li>
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

      <div className="border-brand-navy border-t-[0.75px] w-full"></div>

      {/* Bottom */}
      <div className="flex lg:flex-row flex-col gap-y-6 gap-x-72 2xl:gap-x-[600px] text-[#666] my-4 lg:my-6 mx-4 px-4 md:mx-16 md:px-16 xl:mx-16 xl:px-16">
        <div className="text-base lg:text-2xl xl:text-base">
          Copyright © 2026 Must. All Rights Reserved.
        </div>
        <div className="lg:text-2xl xl:text-base">
          Design by. <b className="text-black">xyz Design Studio</b>
        </div>
        <div className="lg:text-2xl xl:text-base">
          Powered by. <b className="text-black">EpicSphere</b>
        </div>
      </div>
    </section>
  );
};

export default Footer;
