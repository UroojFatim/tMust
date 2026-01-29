import Hero from "@/views/Hero";
import Promotions from "@/views/Promotions";
import ProductList from "@/views/ProductList";
import DifferentFromOthers from "@/views/DifferentFromOthers";
import Newsletter from "@/views/Newsletter";
import ImageSection from "@/views/ImageSection";
import VideoTextSection from "@/views/VideoTextSection";

export default async function Home() {
  return (
    <section className="">
        <Hero></Hero>
        {/* <Promotions></Promotions> */}
        <ProductList></ProductList>
        <ImageSection src="/hero_1.png"></ImageSection>
        <VideoTextSection></VideoTextSection>
        <ProductList></ProductList>
        {/* <DifferentFromOthers></DifferentFromOthers> */}
        <Newsletter></Newsletter>
        <ImageSection src="/hero_2.png"></ImageSection>
    </section>
  );
}
