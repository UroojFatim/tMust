import Wrapper from "@/components/shared/Wrapper";
import MovingProducts from "@/components/MovingProducts";
import Link from "next/link";

export default function ProductList() {
  return (
    <Wrapper noGutters>
      <section className="py-10">
        <div className="max-w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Luxury Collections</h3>
            <Link
              href="/collection/luxury-collection"
              className="text-sm font-semibold text-brand-navy"
            >
              View All
            </Link>
          </div>

          <div>
            <MovingProducts collectionSlug="luxury-collection" />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
