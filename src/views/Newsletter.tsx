import Wrapper from "@/components/shared/Wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const Newsletter = () => {
  return (
    <Wrapper>
      <section className="text-center relative xl:py-20">
        <h1 className="mt-12 lg:mt-1 xl:mt-2 w-full mx-auto absolute font-extrabold text-[66px] lg:text-[8rem] leading-[151px] text-paragraph opacity-[0.08] z-10">
          Newsletter
        </h1>
        <h2 className="font-bold text-3xl lg:text-4xl">
          Subscribe Our Newsletter
        </h2>
        <p className="font-light tracking-wide mt-5">
          Get the latest information and promo offers directly
        </p>
        <div className="flex flex-col lg:flex-row gap-x-3 gap-y-4 items-center text-center justify-center xl:mt-11 lg:mt-9 mt-6">
          <Input
            placeholder="Input email address"
            className="border-black border 2xl:w-[270px] py-5 px-4 rounded-none opacity-70 tracking-tighter text-sm align-middle"
          />
          <Button className="text-white px-10">Get Started</Button>
        </div>
      </section>
    </Wrapper>
  );
};

export default Newsletter;
