import Wrapper from "@/components/shared/Wrapper";
import MovingProducts from "@/components/MovingProducts";

export default function ProductList() {
  return (
    <Wrapper noGutters>
      <section className="py-10">
        <div className="max-w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pashimna Collections</h3>
            <a href="/category/pashimna" className="text-sm font-semibold text-brand-navy">View All</a>
          </div>

          <div>
            <MovingProducts />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}