"use client"

import logo from "/public/MustLogo.png";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu, X } from "lucide-react";
import Wrapper from "../shared/Wrapper";
import CartButton from "../CartButton";
import { Input } from "@/components/ui/input";
import FetchData from "../../../sanity/FetchData";
import { urlForImage } from "../../../sanity/lib/image";

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await FetchData();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const SearchDropdown = () => (
    <div className="absolute top-12 right-0 w-80 bg-white border border-black/20 rounded-lg shadow-lg z-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-black/20 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#212121]"
          autoFocus
        />
        <button
          onClick={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Results */}
      {searchQuery.trim() !== "" && (
        <div className="max-h-96 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No products found</p>
          ) : (
            <div className="space-y-2">
              {filteredProducts.slice(0, 5).map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug.current}`}
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  className="flex gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                >
                  <Image
                    src={urlForImage(product.images[0].asset).url()}
                    alt={product.title}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">${product.price}</p>
                  </div>
                </Link>
              ))}
              {filteredProducts.length > 5 && (
                <p className="text-xs text-gray-500 py-2 text-center">
                  +{filteredProducts.length - 5} more results
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

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

          {/* RIGHT: Icons (Desktop) */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search"
                className="p-2 rounded-full hover:bg-sky-50 transition"
              >
                <Search className="h-5 w-5 text-[#0B1B3A]" />
              </button>

              {showSearch && <SearchDropdown />}
            </div>

            {/* Cart */}
            <div className="relative h-10 w-10 rounded-full flex justify-center items-center bg-sky-50 hover:bg-sky-100 transition">
              <CartButton />
            </div>
          </div>

          {/* MOBILE: Menu */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Mobile Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search"
                className="p-2 rounded-full hover:bg-sky-50 transition"
              >
                <Search className="h-5 w-5 text-[#0B1B3A]" />
              </button>

              {showSearch && (
                <div className="absolute top-12 right-0 w-64 bg-white border border-black/20 rounded-lg shadow-lg z-50 p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border border-black/20 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#212121]"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery("");
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchQuery.trim() !== "" && (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">
                          No products found
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filteredProducts.slice(0, 3).map((product) => (
                            <Link
                              key={product._id}
                              href={`/product/${product.slug.current}`}
                              onClick={() => {
                                setShowSearch(false);
                                setSearchQuery("");
                              }}
                              className="flex gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                            >
                              <Image
                                src={urlForImage(product.images[0].asset).url()}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">
                                  {product.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ${product.price}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="relative h-10 w-10 rounded-full flex justify-center items-center bg-sky-50">
              <CartButton />
            </div>

            {/* Menu */}
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