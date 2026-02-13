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
          <div>
            <MovingProducts
              collectionSlug="virasat-collection"
              initialProducts={initialProducts}
            />
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
