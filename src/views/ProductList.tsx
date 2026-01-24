import Wrapper from "@/components/shared/Wrapper";
import MovingProducts from "@/components/MovingProducts";

export default function ProductList() {
  return (
    <Wrapper>
      <section className="">
        <div className="text-blue-600 font-bold text-sm text-center mb-4">
          PRODUCTS
        </div>
        <div className="font-bold text-4xl text-center mb-16">
          Check What We Have
        </div>
        <MovingProducts />
      </section>
    </Wrapper>
  );
}
