"use client";

import React, { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SIZES = ["xs", "s", "m", "l", "xl"];
const COLORS = ["black", "white", "navy", "gray", "pink", "red", "blue", "beige"];

const PRICE_OPTIONS = [250, 500, 1000, 2000, 3000, 5000, 10000];

export default function FiltersTopBar({
  price,
  setPrice,
  sizes,
  setSizes,
  colors,
  setColors,
  total,
  maxPrice = 10000,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleValue = (
    value: string,
    state: string[],
    setState: (next: string[]) => void,
    checked: boolean | string
  ) => {
    if (checked === true && !state.includes(value)) {
      setState([...state, value]);
      return;
    }
    if (checked !== true && state.includes(value)) {
      setState(state.filter((item) => item !== value));
    }
  };

  const priceOptions = Array.from(
    new Set(PRICE_OPTIONS.filter((value) => value <= maxPrice).concat(maxPrice))
  ).sort((a, b) => a - b);

  const sizeLabel = sizes.length === 0 ? "Sizes: All" : `Sizes: ${sizes.length} selected`;
  const colorLabel = colors.length === 0 ? "Colors: All" : `Colors: ${colors.length} selected`;
  const priceLabel = price[1] === null ? "Price: Any" : `Price: Up to $${price[1]}`;
  const activeChips = [
    ...(price[1] !== null ? [`Up to $${price[1]}`] : []),
    ...sizes.map((size: string) => `Size ${size.toUpperCase()}`),
    ...colors.map((color: string) => `Color ${color.charAt(0).toUpperCase() + color.slice(1)}`),
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
            </Button>
            <p className="text-xs sm:text-sm text-gray-500">{total} Results</p>
          </div>
          <button
            onClick={() => {
              setPrice([0, null]);
              setSizes([]);
              setColors([]);
            }}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            Clear All
          </button>
        </div>

        {isOpen && (
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  {priceLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Price</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={price[1] === null ? "any" : String(price[1])}
                  onValueChange={(value) =>
                    setPrice([0, value === "any" ? null : Number(value)])
                  }
                >
                  <DropdownMenuRadioItem value="any">Any</DropdownMenuRadioItem>
                  {priceOptions.map((value) => (
                    <DropdownMenuRadioItem key={value} value={String(value)}>
                      Up to ${value}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  {sizeLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Size</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SIZES.map((size) => (
                  <DropdownMenuCheckboxItem
                    key={size}
                    checked={sizes.includes(size)}
                    onCheckedChange={(checked) => toggleValue(size, sizes, setSizes, checked)}
                  >
                    {size.toUpperCase()}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  {colorLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Color</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {COLORS.map((color) => (
                  <DropdownMenuCheckboxItem
                    key={color}
                    checked={colors.includes(color)}
                    onCheckedChange={(checked) => toggleValue(color, colors, setColors, checked)}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}