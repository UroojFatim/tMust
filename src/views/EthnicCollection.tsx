import Wrapper from "@/components/shared/Wrapper";
import MovingProducts from "@/components/MovingProducts";

export default function EthnicCollection() {
  return (
    <Wrapper noGutters>
      <section className="py-10">
        <div className="max-w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ethnic Collections</h3>
            <a href="/collection/ethnic-collection" className="text-sm font-semibold text-brand-navy">View All</a>
          </div>

          <div>
            <MovingProducts collectionSlug="ethnic-collection" />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}