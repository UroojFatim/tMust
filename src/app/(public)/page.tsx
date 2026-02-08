import Hero from "@/views/Hero";
import Promotions from "@/views/Promotions";
import ProductList from "@/views/ProductList";
import DifferentFromOthers from "@/views/DifferentFromOthers";
import Newsletter from "@/views/Newsletter";
import ImageSection from "@/views/ImageSection";
import VideoTextSection from "@/views/VideoTextSection";
import EthnicCollection from "@/views/EthnicCollection";
import ShopByCollection from "@/views/ShopByCollection";
import Collections from "@/views/Collections";
import SufiCollection from "@/views/SufiCollection";
import AfsanaShowcase from "@/views/AfsanaShowcase";

export default async function Home() {
  return (
    <section>
      <Hero></Hero>
      {/* <Promotions></Promotions> */}
      <ShopByCollection />
      <Collections />
      <ImageSection
        desktopSrc="/hero/home_desktop_1.png"
        mobileSrc="/hero/home_mobile_1.png"
        alt="Hero Section 1"
      />
      <EthnicCollection />
      <ImageSection
        desktopSrc="/hero/luxurycollectiondesktop.jpg"
        mobileSrc="/hero/luxurycollectionmobile.jpg"
        alt="Hero Section 2"
      />
      <ProductList></ProductList>
      <ImageSection
        desktopSrc="/hero/suficollectiondesktop.jpg"
        mobileSrc="/hero/suficollectionmobile.jpg"
        alt="Hero Section 3"
      />
      <AfsanaShowcase />
      {/* <SufiCollection /> */}
      {/* <VideoTextSection></VideoTextSection> */}
      {/* <DifferentFromOthers></DifferentFromOthers> */}
      {/* <Newsletter></Newsletter> */}
    </section>
  );
}
