import Hero from "@/views/Hero";
import Promotions from "@/views/Promotions";
import ProductList from "@/views/ProductList";
import DifferentFromOthers from "@/views/DifferentFromOthers";
import Newsletter from "@/views/Newsletter";

export default async function Home() {
  return (
    <section className="">
        <Hero></Hero>
        <Promotions></Promotions>
        <ProductList></ProductList>
        <DifferentFromOthers></DifferentFromOthers>
        <Newsletter></Newsletter>
    </section>
  );
}
