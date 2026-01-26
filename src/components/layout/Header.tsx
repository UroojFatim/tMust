import logo from "/public/DineMarketLogo.webp";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu } from "lucide-react";
import { Input } from "../ui/input";
import Wrapper from "../shared/Wrapper";
import CartButton from "../CartButton";

const Header = () => {
  return (
    <Wrapper>
      <div className="flex items-center justify-between py-8 lg:py-8">
        <div className="hidden lg:flex items-center justify-between flex-auto">
          <Link href={"../"}>
            <Image
              className="items-center h-6 w-[140px]"
              src={logo}
              alt="logo"
            />
          </Link>
          <ul className="flex text-center gap-x-10">
            <li className="text-lg">
              <Link href={"/category/female"}>Female</Link>
            </li>
            <li className="text-lg">
              <Link href={"/category/male"}>Male</Link>
            </li>
            <li className="text-lg">
              <Link href={"/category/kids"}>Kids</Link>
            </li>
            <li className="text-lg">
              <Link href={"/AllProducts"}>All Products</Link>
            </li>
          </ul>
          <div className="flex items-center border rounded border-opacity-50">
            <Search className="lg:h-3 lg:w-3 h-4 w-4 ml-2" />
            <Input
              placeholder="What you're looking for"
              className="border-gray-600 opacity-70 tracking-tighter text-sm align-middle"
            />
          </div>
          <div className="relative h-11 w-11 rounded-full flex justify-center items-center bg-gray-200 hover:scale-125 transition">
            <CartButton></CartButton>
          </div>
        </div>
        <div className="lg:hidden flex flex-auto justify-between">
          <Image className="items-center h-6 w-[140px]" src={logo} alt="logo" />
          <Sheet>
            <SheetTrigger>
              <Menu className="h-7 w-7" />
            </SheetTrigger>
            <SheetContent>
              <Image
                className="items-center h-6 w-[140px] flex my-6 mx-5"
                src={logo}
                alt="logo"
              />
              <div className="flex flex-col items-center mt-20">
                <CartButton></CartButton>
                <ul className="flex text-center bg-white gap-y-3 mt-5 gap-x-8 flex-col items-center">
                  <li className="text-lg">
                    <Link href={"/category/Female"}>Female</Link>
                  </li>
                  <li className="text-lg">
                    <Link href={"/category/Male"}>Male</Link>
                  </li>
                  <li className="text-lg">
                    <Link href={"/category/Kids"}>Kids</Link>
                  </li>
                  <li className="text-lg">
                    <Link href={"/AllProducts"}>All Products</Link>
                  </li>
                </ul>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Wrapper>
  );
};

export default Header;
