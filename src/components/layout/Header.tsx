"use client";

import logo from "/public/MustLogo.png";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Search, Menu, X } from "lucide-react";
import Wrapper from "../shared/Wrapper";
import CartButton from "../CartButton";
import { Input } from "@/components/ui/input";

interface NavItem {
  label: string;
  href: string;
}

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [styles, setStyles] = useState<NavItem[]>([]);
  const [collections, setCollections] = useState<NavItem[]>([]);

  const getProductImage = (product: any) => {
    const img = product?.images?.[0];
    if (typeof img === "string") return img;
    if (img?.url) return img.url;
    if (img?.asset?.url) return img.asset.url;
    const variantImg = product?.variants?.[0]?.images?.[0];
    if (typeof variantImg === "string") return variantImg;
    if (variantImg?.url) return variantImg.url;
    if (variantImg?.asset?.url) return variantImg.asset.url;
    return "/products/placeholder.jpg";
  };

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch collections and styles from MongoDB
  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const [collectionsRes, stylesRes] = await Promise.all([
          fetch("/api/public/collections"),
          fetch("/api/public/styles"),
        ]);

        const collectionsData = await collectionsRes.json();
        const stylesData = await stylesRes.json();

        // Set styles
        if (stylesData.ok && stylesData.styles) {
          const styleItems = stylesData.styles.map((style: any) => ({
            label: style.name,
            href: `/collection/${style.slug}`,
          }));
          setStyles(styleItems);
        }

        // Set collections
        if (collectionsData.ok && collectionsData.collections) {
          const collectionItems = collectionsData.collections.map(
            (collection: any) => ({
              label: collection.name,
              href: `/collection/${collection.slug}`,
            }),
          );
          setCollections(collectionItems);
        }
      } catch (error) {
        console.error("Error fetching nav items:", error);
      }
    };

    fetchNavItems();
  }, []);

  // Fetch products on mount (MongoDB public API)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/public/products", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load products: ${res.status}`);
        }
        const data = await res.json();
        setProducts(data.products || []);
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
      const filtered = products.filter((product) => {
        const title = (product.title || "").toLowerCase();
        const collection = (product.collection || "").toLowerCase();
        const styleValue = product.style;
        const style = Array.isArray(styleValue)
          ? styleValue.join(" ").toLowerCase()
          : (styleValue || "").toString().toLowerCase();
        return title.includes(query) || collection.includes(query) || style.includes(query);
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const SearchDropdown = () => (
    <div className="absolute top-12 left-0 w-80 bg-white border border-black/20 rounded-lg shadow-lg z-50 p-4">
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
                  href={`/product/${product.slug}`}
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  className="flex gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                >
                  <Image
                    src={getProductImage(product)}
                    alt={product.title}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${Number(product.basePrice || 0).toFixed(2)}
                    </p>
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

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSearch]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      <Wrapper>
        <div className="flex items-center justify-between py-4 lg:py-5">
          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger aria-label="Open menu" className="p-2">
                <Menu className="h-6 w-6 text-black" />
              </SheetTrigger>

              <SheetContent side="left" className="bg-white overflow-y-auto">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Browse our collections and styles
                </SheetDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Image
                    src={logo}
                    alt="MUST"
                    className="h-12 w-auto object-contain"
                    priority
                  />
                </div>

                <nav className="mt-8 space-y-6">
                  {/* All Products Link */}
                  <Link
                    href="/all-products"
                    className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3"
                  >
                    All Products
                  </Link>

                  {/* Styles Section */}
                  {/* {styles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Styles
                      </h3>
                      <ul className="flex flex-col gap-2">
                        {styles.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block py-1.5 text-base text-gray-700 hover:text-sky-600 transition-colors"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}

                  {/* Collections Section */}
                  {collections.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Collections
                      </h3>
                      <ul className="flex flex-col gap-2">
                        {collections.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block py-1.5 text-base text-gray-700 hover:text-sky-600 transition-colors"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="MUST"
                className="h-14 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* RIGHT: Search + Cart */}
          <div className="flex items-center gap-2">
            {/* Animated Search Bar */}
            <div className="search-container relative flex items-center">
              <div
                className={`flex items-center transition-all duration-300 ${
                  showSearch ? "w-64" : "w-0"
                } overflow-hidden bg-white rounded-lg`}
              >
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-black/20 rounded-lg py-4 px-4 text-sm focus:outline-none focus:border-[#212121] bg-white"
                  style={{ visibility: showSearch ? "visible" : "hidden" }}
                />
              </div>

              <button
                onClick={() => {
                  if (showSearch) {
                    setShowSearch(false);
                    setSearchQuery("");
                  } else {
                    setShowSearch(true);
                  }
                }}
                aria-label="Search"
                className="p-2 rounded-full hover:bg-white/40 transition flex-shrink-0 z-10"
              >
                <Search className="h-6 w-6 text-black" />
              </button>

              {/* Search Dropdown Results */}
              {showSearch && searchQuery.trim() !== "" && (
                <div className="absolute top-12 left-0 w-80 bg-white border border-black/20 rounded-lg shadow-lg z-50 p-4">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">
                      No products found
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.slice(0, 5).map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug}`}
                          onClick={() => {
                            setShowSearch(false);
                            setSearchQuery("");
                          }}
                          className="flex gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                        >
                          <Image
                            src={getProductImage(product)}
                            alt={product.title}
                            width={50}
                            height={50}
                            className="rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${Number(product.basePrice || 0).toFixed(2)}
                            </p>
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

            <div className="relative h-10 w-10 rounded-full flex justify-center items-center text-brand-navy hover:text-brand-navy/70 transition">
              <CartButton />
            </div>
          </div>
        </div>
      </Wrapper>
    </header>
  );
};

export default Header;
