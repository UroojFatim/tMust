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
    <aside className="w-[260px] shrink-0 border rounded-xl p-5 h-fit sticky top-24">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        <button
          onClick={() => {
            setPrice([0, maxPrice]);
            setSizes([]);
            setColors([]);
          }}
          className="text-sm text-blue-600"
        >
          Clear All
        </button>
      </div>

      <div className="mb-6">
        <p className="font-medium mb-2">Price</p>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={price[1]}
          onChange={(e) => setPrice([0, Number(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-1">
          <span>$0</span>
          <span>${price[1]}</span>
        </div>
      </div>

      {/* SIZE */}
      <div className="mb-6">
        <p className="font-medium mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggle(s, sizes, setSizes)}
              className={`px-3 py-1 border rounded text-sm ${
                sizes.includes(s) ? "bg-black text-white" : "bg-white"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* COLOR */}
      <div className="mb-6">
        <p className="font-medium mb-2">Color</p>
        <div className="space-y-2">
          {COLORS.map((c) => (
            <label key={c} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={colors.includes(c)}
                onChange={() => toggle(c, colors, setColors)}
              />
              <span className="capitalize">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">{total} results</p>
    </aside>
  );
}