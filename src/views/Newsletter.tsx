import Wrapper from "@/components/shared/Wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const Newsletter = () => {
  return (
    <Wrapper>
      <section className="text-center relative py-12 sm:py-16 md:py-20 xl:py-20 px-4">
        <h1 className="w-full mx-auto absolute left-0 right-0 top-0 md:top-2 lg:top-1 xl:top-2 font-extrabold text-[40px] sm:text-[60px] md:text-[80px] lg:text-[100px] xl:text-[128px] leading-tight md:leading-[151px] text-paragraph opacity-[0.08] pointer-events-none select-none overflow-hidden whitespace-nowrap">
          Newsletter
        </h1>
        <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl relative z-20 pt-8 sm:pt-6 md:pt-4 lg:pt-0">
          Subscribe Our Newsletter
        </h2>
        <p className="font-light tracking-wide mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base px-4 relative z-20">
          Get the latest information and promo offers directly
        </p>
        <div className="flex flex-col sm:flex-row gap-x-3 gap-y-4 items-stretch sm:items-center text-center justify-center mt-6 sm:mt-8 lg:mt-9 xl:mt-11 relative z-20 max-w-md sm:max-w-lg mx-auto px-4 sm:px-0">
          <Input
            placeholder="Input email address"
            className="border-black border w-full sm:flex-1 sm:max-w-[270px] py-5 px-4 rounded-none opacity-70 tracking-tighter text-sm align-middle"
          />
          <Button className="text-white px-10 py-5 w-full sm:w-auto whitespace-nowrap">Get Started</Button>
        </div>
      </section>
    </Wrapper>
  );
};

export default Newsletter;
