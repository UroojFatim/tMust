import Wrapper from "@/components/shared/Wrapper";
import MovingProducts from "@/components/MovingProducts";

export default function ProductList() {
  return (
    <Wrapper>
      <section className="py-10">
        <div className="text-center">
          <p className="text-brand-navy font-semibold text-xs tracking-[0.3em]">
            PRODUCTS
          </p>
          <h2 className="mt-3 font-bold text-3xl md:text-4xl">
            Check What We Have
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Fresh drops, best sellers, and timeless traditional pieces.
          </p>
        </div>

        <div className="mt-10">
          <MovingProducts />
        </div>
      </section>
    </Wrapper>
  );
}