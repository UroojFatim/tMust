import Hero from "@/views/Hero";
import Promotions from "@/views/Promotions";
import ProductList from "@/views/ProductList";
import DifferentFromOthers from "@/views/DifferentFromOthers";
import Newsletter from "@/views/Newsletter";
import ImageSection from "@/views/ImageSection";
import VideoTextSection from "@/views/VideoTextSection";
import EthnicCollection from "@/views/EthnicCollection";
import ShopByCollection from "@/views/ShopByCollection";

export default async function Home() {
  return (
    <section>
      <Hero></Hero>
      {/* <Promotions></Promotions> */}
      <ImageSection
        desktopSrc="/hero/home_desktop_1.png"
        mobileSrc="/hero/home_mobile_1.png"
        alt="Hero Section 1"
      />
      <ShopByCollection />
      <EthnicCollection />
      <ImageSection
        desktopSrc="/hero/home_desktop_2.png"
        mobileSrc="/hero/home_mobile_2.png"
        alt="Hero Section 2"
      />
      <ProductList></ProductList>
      {/* <VideoTextSection></VideoTextSection> */}
      {/* <DifferentFromOthers></DifferentFromOthers> */}
      {/* <Newsletter></Newsletter> */}
    </section>
  );
}
