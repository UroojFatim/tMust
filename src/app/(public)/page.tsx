import Hero from "@/views/Hero";
import LuxuryCollection from "@/views/LuxuryCollection";
import ImageSection from "@/views/ImageSection";
import EthnicCollection from "@/views/EthnicCollection";
import ShopByCollection from "@/views/ShopByCollection";
import Collections from "@/views/Collections";
import AfsanaShowcase from "@/views/AfsanaShowcase";
import { getDatabase } from "@/lib/mongodb";

type CollectionItem = {
  _id?: string;
  name: string;
  slug: string;
};

type ProductItem = {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  basePrice?: number;
  productCode?: string;
  collection?: string;
  collectionSlug?: string;
  style?: string;
  styleSlug?: string;
  tags?: string[];
  details?: Array<{ key: string; valueHtml: string }>;
  purchasePrice?: number;
  variants?: Array<{ images?: Array<{ url?: string }> }>;
  images?: Array<{ url?: string }>;
  createdAt?: string;
  updatedAt?: string;
};

const serializeProducts = (products: any[]): ProductItem[] =>
  products.map((product) => ({
    _id: product._id?.toString(),
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    productCode: product.productCode,
    collection: product.collection,
    collectionSlug: product.collectionSlug,
    style: product.style,
    styleSlug: product.styleSlug,
    tags: product.tags,
    details: product.details,
    purchasePrice: product.purchasePrice,
    variants: product.variants,
    images: product.images,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

const serializeCollections = (collections: any[]): CollectionItem[] =>
  collections.map((collection) => ({
    _id: collection._id?.toString(),
    name: collection.name,
    slug: collection.slug ?? "",
  }));

const getCollections = async () => {
  const db = await getDatabase();
  const collections = await db
    .collection("inventory_collections")
    .find({})
    .sort({ name: 1 })
    .toArray();
  return serializeCollections(collections);
};

const getAllProducts = async () => {
  const db = await getDatabase();
  const products = await db
    .collection("inventory_products")
    .find({
      $or: [{ displayOnWebsite: { $exists: false } }, { displayOnWebsite: true }],
    })
    .sort({ createdAt: -1 })
    .toArray();
  return serializeProducts(products);
};

const getProductsByCollection = async (collectionSlug: string) => {
  const db = await getDatabase();
  const products = await db
    .collection("inventory_products")
    .find({
      $and: [
        {
          $or: [{ displayOnWebsite: { $exists: false } }, { displayOnWebsite: true }],
        },
        {
          $or: [
            { collectionSlug },
            { collectionSlug: collectionSlug.toLowerCase() },
            { collection: collectionSlug },
            { collection: new RegExp(collectionSlug, "i") },
          ],
        },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();
  return serializeProducts(products);
};

export default async function Home() {
  const [collections, products, luxuryProducts, ethnicProducts] =
    await Promise.all([
      getCollections(),
      getAllProducts(),
      getProductsByCollection("luxury-collection"),
      getProductsByCollection("virasat-collection"),
    ]);

  return (
    <section>
      <Hero></Hero>
      {/* <Promotions></Promotions> */}
      {/* <ShopByCollection
        initialCollections={collections}
        initialProducts={products}
      /> */}
      <Collections initialCollections={collections} />
      <ImageSection
        desktopSrc="/hero/virasatcollectiondesktop.png"
        mobileSrc="/hero/virasatcollectionmobile.png"
        alt="Hero Section 1"
        collectionName="Virasat Collection"
        collectionSlug="virasat-collection"
        shopNow={true}
      />
      <EthnicCollection initialProducts={ethnicProducts} />
      <ImageSection
        desktopSrc="/hero/luxurycollectiondesktop.png"
        mobileSrc="/hero/luxurycollectionmobile.png"
        alt="Hero Section 2"
        collectionName="Luxury Collection"
        collectionSlug="luxury-collection"
        shopNow={true}
      />
      <LuxuryCollection initialProducts={luxuryProducts} />
      <ImageSection
        desktopSrc="/hero/kalaamcollectiondesktop.png"
        mobileSrc="/hero/kalaamcollectionmobile.png"
        alt="Hero Section 3"
        collectionName="Kalaam Collection"
        collectionSlug="kalaam-collection"
        shopNow={true}
      />
      <AfsanaShowcase />
      {/* <SufiCollection /> */}
      {/* <VideoTextSection></VideoTextSection> */}
      {/* <DifferentFromOthers></DifferentFromOthers> */}
      {/* <Newsletter></Newsletter> */}
    </section>
  );
}
