import logo from "/public/MustLogo.png";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu } from "lucide-react";
import Wrapper from "../shared/Wrapper";
import CartButton from "../CartButton";

const NAV_ITEMS = [
  { label: "All", href: "/AllProducts" },
  { label: "New Arrivals", href: "/category/new_arrivals" },
  { label: "Best Sellers", href: "/category/best_sellers" },
  { label: "Casual Wear", href: "/category/casual_wears" },
  { label: "Formal Wear", href: "/category/formal_wears" },
  { label: "Fancy / Party Wear", href: "/category/fancy_party_wear" },
  { label: "Traditional Wear", href: "/category/traditional_wear" },
];

const Header = () => {
  return (
    <header className="bg-white border-b border-black/10">
      <Wrapper>
        <div className="flex items-center justify-between py-4 lg:py-5">
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="MUST"
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* CENTER: Nav (Desktop) */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-x-10 text-[15px] font-medium text-black">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-brand-navy transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT: Icons */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Search Icon (you can link to a search page or open a modal later) */}
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 rounded-full hover:bg-sky-50 transition"
            >
              <Search className="h-5 w-5 text-[#0B1B3A]" />
            </Link>

            {/* Cart */}
            <div className="relative h-10 w-10 rounded-full flex justify-center items-center bg-sky-50 hover:bg-sky-100 transition">
              <CartButton />
            </div>
          </div>

          {/* MOBILE: Logo + Menu */}
          <div className="lg:hidden flex items-center gap-3">
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 rounded-full hover:bg-sky-50 transition"
            >
              <Search className="h-5 w-5 text-[#0B1B3A]" />
            </Link>

            <div className="relative h-10 w-10 rounded-full flex justify-center items-center bg-sky-50">
              <CartButton />
            </div>

            <Sheet>
              <SheetTrigger aria-label="Open menu">
                <Menu className="h-7 w-7 text-[#0B1B3A]" />
              </SheetTrigger>

              <SheetContent className="bg-white">
                <div className="flex items-center gap-2 mt-2">
                  <Image
                    src={logo}
                    alt="MUST"
                    className="h-7 w-auto object-contain"
                    priority
                  />
                </div>

                <ul className="mt-10 flex flex-col gap-4 text-base font-medium text-black">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block py-2 hover:text-sky-600 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Wrapper>
    </header>
  );
};

export default Header;