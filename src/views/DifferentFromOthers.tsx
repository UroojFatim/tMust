import React from "react";
import Image from "next/image";
import unique from "../../public/unique.webp";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/shared/Wrapper";
import Link from "next/link";

const DifferentFromOthers = () => {
  return (
    <section className="mt-28 relative">
      <Wrapper>
        <div className="flex xl:text-[46px] lg:text-[56px] text-[44px] font-bold lg:ml-[100px] xl:ml-[650px] 2xl:ml-[1250px] font-sans leading-[55px] tracking-wide opacity-95">
          Unique and Authentic Vintage Designer Jewellery
        </div>
        <div className="flex xl:flex-row flex-col gap-y-10">
          {/* Left Side */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 mt-7 lg:mt-16 2xl:gap-1 xl:gap-5 gap-10">
            <div className="h-40 w-40 lg:h-20 lg:w-[432px] xl:h-44 xl:w-48 2xl:h-20 2xl:w-[432px] space-y-3">
              <h1 className="font-semibold text-lg tracking-wider leading-5">
                Using Good Quality Materials
              </h1>
              <p className="leading-5 lg:text-lg tracking-wider text-paragraph font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="h-40 w-40 lg:h-20 lg:w-[432px] xl:h-44 xl:w-48 2xl:h-20 2xl:w-[432px] space-y-3">
              <h1 className="font-semibold text-lg tracking-wider leading-5">
                100% Handmade Products
              </h1>
              <p className="leading-5 lg:text-lg tracking-wider text-paragraph font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="h-40 w-40 lg:h-20 lg:w-[432px] xl:h-44 xl:w-48 2xl:h-20 2xl:w-[432px] space-y-3">
              <h1 className="font-semibold text-lg tracking-wider leading-5">
                Modern Fashion Design
              </h1>
              <p className="leading-5 lg:text-lg tracking-wider text-paragraph font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="h-40 w-40 lg:h-20 lg:w-[432px] xl:h-44 xl:w-48 2xl:h-20 2xl:w-[432px] space-y-3">
              <h1 className="font-semibold text-lg tracking-wider leading-5">
                Discount for Bulk Orders
              </h1>
              <p className="leading-5 lg:text-lg tracking-wider text-paragraph font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          </div>
          {/* Right Side */}
          <div className="flex-1 flex lg:flex-row flex-col align-middle lg:gap-x-6 justify-center items-center">
            <Image
              height={1200}
              width={1100}
              className="scale-90 2xl:scale-75 "
              src={unique}
              alt="features"
            ></Image>
            <div className="max-w-3xl 2xl:max-w-none">
              <p className="max-w-3xl 2xl:max-w-none text-justify mt-4 tracking-wide leading-relaxed text-paragraph">
                This piece is ethically crafted in our small family-owned
                workshop in Peru with unmatched attention to detail and care.
                The Natural color is the actual natural color of the fiber,
                undyed and 100% traceable.
              </p>
              <Link href={"/AllProducts"}>
                <Button className=" bg-[#212121] text-white font-bold mt-8 py-4 px-8 lg:py-5 lg:px-24 xl:py-4 xl:px-4 text-sm lg:text-base">
                  See All Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Wrapper>
      <div className="bg-[#fbfcff] h-[90%] lg:h-[94%] xl:h-[90%] w-full absolute top-36 lg:top-16 xl:top-24 -z-10">
        <h1
          className="font-extrabold text-7xl lg:text-[6.875rem] leading-[110px] text-paragraph opacity-[0.08] w-full
      mt-40 ml-10 lg:mt-24 lg:ml-16 xl:mt-28 xl:ml-36 xl:w-1/3 z-10 justify-start"
        >
          Different From Others
        </h1>
      </div>
    </section>
  );
};

export default DifferentFromOthers;
