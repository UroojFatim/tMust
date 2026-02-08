import Wrapper from "@/components/shared/Wrapper";
import MovingProducts from "@/components/MovingProducts";
import Link from "next/link";

type EthnicCollectionProps = {
  initialProducts?: any[];
};

export default function EthnicCollection({
  initialProducts,
}: EthnicCollectionProps) {
  return (
    <Wrapper noGutters>
      <section className="py-10">
        <div className="max-w-full">
          {/* <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ethnic Collections</h3>
            <Link
              href="/collection/ethnic-collection"
              className="text-sm font-semibold text-brand-navy"
            >
              View All
            </Link>
          </div> */}

          <div>
            <MovingProducts
              collectionSlug="ethnic-collection"
              initialProducts={initialProducts}
            />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
