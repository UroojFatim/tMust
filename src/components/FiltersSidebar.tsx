"use client";

const SIZES = ["xs", "s", "m", "l", "xl", "24", "26", "28", "30", "32"];
const COLORS = ["black", "white", "navy", "gray", "pink", "red", "blue", "beige"];

export default function FiltersSidebar({
  price,
  setPrice,
  sizes,
  setSizes,
  colors,
  setColors,
  total,
  maxPrice = 10000,
}: any) {
  const toggle = (value: string, state: string[], setState: any) => {
    setState(state.includes(value) ? state.filter((v) => v !== value) : [...state, value]);
  };

  return (
    <aside className="w-full lg:w-[260px] lg:shrink-0 border rounded-xl p-3 sm:p-4 lg:p-5 h-fit lg:sticky lg:top-24">
      <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-4">
        <h3 className="font-semibold text-sm sm:text-base">Filters</h3>
        <button
          onClick={() => {
            setPrice([0, maxPrice]);
            setSizes([]);
            setColors([]);
          }}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 transition"
        >
          Clear All
        </button>
      </div>

      <div className="mb-4 sm:mb-6">
        <p className="font-medium text-sm mb-2">Price</p>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={price[1]}
          onChange={(e) => setPrice([0, Number(e.target.value)])}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-xs sm:text-sm mt-1">
          <span>$0</span>
          <span>${price[1]}</span>
        </div>
      </div>

      {/* SIZE */}
      <div className="mb-4 sm:mb-6">
        <p className="font-medium text-sm mb-2">Size</p>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s, sizes, setSizes)}
              className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm transition ${
                sizes.includes(s) ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* COLOR */}
      <div className="mb-4 sm:mb-6">
        <p className="font-medium text-sm mb-2">Color</p>
        <div className="space-y-1.5 sm:space-y-2">
          {COLORS.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={colors.includes(c)}
                onChange={() => toggle(c, colors, setColors)}
                className="cursor-pointer"
              />
              <span className="capitalize">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">{total} results</p>
    </aside>
  );
}