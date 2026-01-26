import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import HeroImage from "../../public/tMust_Hero.png";
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
      <div className="flex space-y-10 mb-32 flex-col lg:flex-row relative">
        {/* Left Div */}
        <div className="flex-1">
          <div>
            <Badge className="mt-10 lg:mt-24 py-1 px-5 rounded bg-brand-sky text-brand-navy font-semibold text-lg line">
              Sale 70%
            </Badge>
          </div>
          <div>
            <h1 className="scroll-m-20 text-[52px] leading-none font-bold lg:text-6xl max-w-md 2xl:max-w-7xl opacity-90 mt-9">
              MUST COLLECTION
            </h1>
          </div>
          <div>
            <p className="text-[17px] max-w-sm 2xl:max-w-4xl text-gray-500 mt-9">
              Anyone can beat you but no one can beat your outfit as long as
              you wear MUST outfits.
            </p>
          </div>
          <div>
            <Link href={"/AllProducts"}>
              <Button className=" mt-9 bg-brand-navy 2xl:text-lg text-white font-bold py-6 px-20 md:py-7 md:px-[40px] 2xl:py-7 2xl:px-[100px] gap-x-3 lg:max-w-[160px] 2xl:max-w-[700px] border-none rounded-xl ">
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
          {/* <div className="grid grid-cols-2 grid-rows-2 mt-10 2xl:mt-56">
              <div className="lg:flex lg:gap-x-5 2xl:gap-x-36">
                <Image src={bazaar} alt="bazaar" className="mr-5 mb-5" />
                <Image src={versace} alt="versace" className="mr-5 mb-5" />
              </div>
              <div className="lg:flex lg:gap-x-5 2xl:gap-x-36">
                <Image src={bustle} alt="bustle" className="mb-5 mr-5" />
                <Image src={instyle} alt="instyle" className="mb-5" />
              </div>
            </div> */}
        </div>
        {/* Right Div */}
        <div className="flex-1 relative hidden lg:flex items-center justify-center">
          {/* Stage */}
          <div className="relative w-full max-w-[520px] h-[480px] xl:max-w-[620px] xl:h-[560px] 2xl:max-w-[720px] 2xl:h-[640px]">

            {/* Sky Circle (perfect center) */}
            <div
              className="absolute left-1/2 top-1/2 
                 -translate-x-1/2 -translate-y-1/2
                 w-[360px] h-[360px] 
                 xl:w-[580px] xl:h-[580px] 
                 rounded-full bg-brand-sky z-0"
            />

            {/* Girl Image (centered left/right, pushed DOWN) */}
            <div
              className="absolute left-1/2 bottom-[-80px] 
                 -translate-x-1/2
                 w-[350px] h-[500px]
                 xl:w-[600px] xl:h-[650px]
                 2xl:w-[650px] 2xl:h-[700px]
                 z-10"
            >
              <Image
                src={HeroImage}
                alt="Hero Model"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Hero;
