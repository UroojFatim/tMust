import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import HeroImage from "../../public/HeroImage.webp";
import { ShoppingCart } from "lucide-react";
import Wrapper from "@/components/shared/Wrapper";
import bazaar from "../../public/bazaar.png";
import bustle from "../../public/bustle.png";
import instyle from "../../public/instyle.webp";
import versace from "../../public/versace.png";
import Link from "next/link";

const Hero = () => {
  return (
    <Wrapper>
        <div className="flex space-y-10 mb-12 flex-col lg:flex-row relative">
          {/* Left Div */}
          <div className="flex-1">
            <div>
              <Badge className="mt-10 lg:mt-24 py-1 px-5 rounded bg-blue-100 text-blue-700 font-semibold text-lg line">
                Sale 70%
              </Badge>
            </div>
            <div>
              <h1 className="scroll-m-20 text-[52px] leading-none font-bold lg:text-6xl max-w-md 2xl:max-w-7xl opacity-90 mt-9">
                An Industrial Take on Streetwear
              </h1>
            </div>
            <div>
              <p className="text-[17px] max-w-sm 2xl:max-w-4xl text-gray-500 mt-9">
                Anyone can beat you but no one can beat your outfit as long as
                you wear Dine outfits.
              </p>
            </div>
            <div>
              <Link href={"/AllProducts"}>
              <Button className=" mt-9 bg-[#212121] 2xl:text-lg text-white font-bold py-7 px-20 md:py-9 md:px-[89px] 2xl:py-7 2xl:px-[100px] md:gap-x-6 gap-x-3 shadow-md lg:max-w-[160px] 2xl:max-w-[700px]">
                <div>
                  <ShoppingCart
                    className="2xl:h-7 2xl:w-7 h-6 w-6"
                    color="#ffffff"
                  />
                </div>
                <div>Start Shopping</div>
              </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 mt-10 2xl:mt-56">
              <div className="lg:flex lg:gap-x-5 2xl:gap-x-36">
                <Image src={bazaar} alt="bazaar" className="mr-5 mb-5" />
                <Image src={versace} alt="versace" className="mr-5 mb-5" />
              </div>
              <div className="lg:flex lg:gap-x-5 2xl:gap-x-36">
                <Image src={bustle} alt="bustle" className="mb-5 mr-5" />
                <Image src={instyle} alt="instyle" className="mb-5" />
              </div>
            </div>
          </div>
          {/* Right Div */}
          <div className="flex-1 align-middle justify-center relative hidden lg:block">
            <div className="lg:h-[600px] lg:w-[600px] rounded-full absolute bg-pink z-[-1]"></div>
            <div className="flex items-center justify-center h-[600px] w-[600px] absolute z-10">
              <Image
                alt="Main Image"
                src={HeroImage}
                className="scale-110"
              ></Image>
            </div>
          </div>
        </div>
    </Wrapper>
  );
};

export default Hero;
