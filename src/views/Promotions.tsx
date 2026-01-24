import React from "react";
import Image from "next/image";
import left_promotion from "../../public/summer_promotion.webp";
import Wrapper from "@/components/shared/Wrapper";
import promotion1 from "../../public/promotion1.webp";
import promotion2 from "../../public/promotion2.webp";
import promotion3 from "../../public/promotion3.webp";

export default async function Promotions() {
  return (
    <Wrapper>
      <section className="h-full mb-32">
        <div className="text-blue-600 font-bold text-sm text-center mb-4">
          PROMOTIONS
        </div>
        <div className="font-bold text-4xl text-center mb-8">
          Our Promotions Events
        </div>
        <div className="flex gap-x-9 gap-y-5 flex-col lg:flex-row">
          {/* left */}
          <div className="basis-[45%] lg:basis-[50%] 2xl:basis-[65%] space-y-4">
            <div className="flex-1 bg-[#d6d6d8] flex flex-col justify-center 2xl:justify-between lg:flex-row items-center text-center lg:text-start">
              <div className="mt-10 lg:mt-0">
                <div className="flex items-baseline gap-x-1">
                  <div className="text-3xl lg:text-[20px] font-bold">
                    GET UP TO
                  </div>
                  <span className="text-4xl lg:text-[32px]">
                    60%
                  </span>
                </div>
                <div className="text-lg">For the summer season</div>
              </div>
              <div>
                <Image src={promotion3} alt="promotion"></Image>
              </div>
            </div>
            <div className="flex-1 flex-col justify-center items-center bg-[#212121] pt-7 pb-8 text-white">
              <div className="items-center text-center">
                <h1 className="text-4xl font-extrabold m-3 tracking-wide font-PT_Serif">
                  GET 30% Off
                </h1>
                <div className="text-md">USE PROMO CODE</div>
                <button className="tracking-[0.35em] font-bold py-[6px] px-8 mt-1 rounded-lg border-spacing-0 bg-[#474747]">
                  DINEWEEKENDSALE
                </button>
              </div>
            </div>
          </div>
          {/* right */}
          <div className="basis-[55%] lg:basis-[50%] 2xl:basis-[35%] flex flex-col lg:flex-row justify-center gap-4 ">
            <div className="bg-gray-300 flex-1 w-[100%]">
              <h3 className="mt-6 ml-5">Flex Sweatshirt</h3>
              <div className="flex ml-5">
                <p className="line-through text-lg">$100.00</p>
                <p className="bold text-xl ml-4 font-bold">$75.00</p>
              </div>
              <Image
                height={500}
                width={400}
                className="max-h-[330px] object-cover  object-top mt-4"
                src={promotion1}
                alt="product"
              />
            </div>
            <div className="bg-gray-300 flex-1 w-[100%]">
              <h3 className="mt-6 ml-5">Flex Push Button Bomber</h3>
              <div className="flex ml-5">
                <p className="line-through text-lg">$225.00</p>
                <p className="bold text-xl ml-4 font-bold">$190.00</p>
              </div>
              <Image
                height={500}
                width={400}
                className="max-h-[330px] object-cover object-top mt-4"
                src={promotion2}
                alt="product"
              />
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
