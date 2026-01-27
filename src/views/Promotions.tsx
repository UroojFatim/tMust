import React from "react";
import Image from "next/image";
import left_promotion from "../../public/summer_promotion.webp";
import Wrapper from "@/components/shared/Wrapper";
import promotion1 from "../../public/tMUST1.png";
import promotion2 from "../../public/promotion1.webp";
import promotion3 from "../../public/promotion2.webp";

export default async function Promotions() {
  return (
    <Wrapper>
      <section className="h-full mb-32">
        <div className="text-brand-navy font-bold text-sm text-center mb-4">
          PROMOTIONS
        </div>
        <div className="font-bold text-4xl text-center mb-8">
          Our Promotions Events
        </div>
        <div className="flex gap-x-9 gap-y-5 flex-col lg:flex-row">
          {/* left */}
          <div className="basis-[45%] lg:basis-[50%] 2xl:basis-[65%] space-y-4">
            <div className="flex-1 bg-brand-sky_light border shadow-md flex flex-col justify-center 2xl:justify-between lg:flex-row items-center text-center lg:text-start gap-9">
              <div className="max-w-2xl w-full mx-auto flex justify-between">
                <div className="flex flex-col justify-center gap-x-1">
                  <div className="text-3xl lg:text-[20px] font-bold">
                    GET UP TO
                  </div>
                  <span className="text-4xl lg:text-5xl">60%</span>
                  <div className="text-lg">For the summer season</div>
                </div>
                <div>
                  <Image src={promotion1} alt="promotion" />
                </div>
              </div>
            </div>
            <div className="flex-1 flex-col justify-center items-center bg-[#212121] pt-7 pb-8 text-white">
              <div className="items-center text-center">
                <h1 className="text-4xl font-extrabold m-3 tracking-wide font-PT_Serif">
                  GET 30% Off
                </h1>
                <div className="text-md">USE PROMO CODE</div>
                <button className="tracking-[0.35em] font-bold py-[6px] px-8 mt-1 rounded-lg border-spacing-0 bg-[#474747]">
                  MUST30SALE
                </button>
              </div>
            </div>
          </div>
          {/* right */}
          <div className="basis-[55%] lg:basis-[50%] 2xl:basis-[35%] flex flex-col lg:flex-row justify-center gap-4 ">
            <div className="bg-brand-sky_light border shadow-md flex-1 w-[100%] flex flex-col justify-end items-center text-center">
              <h3 className="mt-6 font-bold text-2xl font-PT_Serif">
                Mehr-e-Zar
              </h3>
              <div className="flex gap-x-2">
                <p className="line-through">$750.00</p>
                <p className="font-bold">$500.00</p>
              </div>
              <Image
                height={500}
                width={400}
                className="max-h-[330px] object-cover object-top mt-4"
                src={promotion2}
                alt="product"
              />
            </div>
            <div className="bg-brand-sky_light flex-1 w-[100%] border shadow-md flex flex-col justify-end items-center text-center">
              <h3 className="mt-6 font-bold text-2xl font-PT_Serif">
                Rose Veil
              </h3>
              <div className="flex gap-x-2">
                <p className="line-through">$750.00</p>
                <p className="font-bold">$500.00</p>
              </div>
              <Image
                height={500}
                width={400}
                className="max-h-[330px] object-cover object-top mt-4"
                src={promotion3}
                alt="product"
              />
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
