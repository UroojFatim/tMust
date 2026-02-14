import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";
import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import ImageSection from "@/views/ImageSection";

async function getStyleData(slug: string) {
  try {
    const db = await getDatabase();

    const [styles, products] = await Promise.all([
      db.collection("inventory_styles").find({}).sort({ name: 1 }).toArray(),
      db
        .collection("inventory_products")
        .find({
          $or: [{ displayOnWebsite: { $exists: false } }, { displayOnWebsite: true }],
        })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    const stylesData = styles.map((s: any) => ({
      _id: s._id?.toString(),
      name: s.name,
      slug: s.slug,
    }));

    const productsData = products.map((p: any) => ({
      _id: p._id?.toString(),
      title: p.title,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      basePrice: p.basePrice,
      productCode: p.productCode,
      collection: p.collection,
      collectionSlug: p.collectionSlug,
      style: p.style,
      styleSlug: p.styleSlug,
      tags: p.tags,
      details: p.details,
      purchasePrice: p.purchasePrice,
      variants: p.variants,
      images: p.images,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    const style = stylesData.find((s: any) => s.slug === slug);
    if (!style) {
      return null;
    }

    const matchesStyleName = (value?: string) =>
      value?.toLowerCase().replace(/\s+/g, "-") === slug;

    let filtered = productsData.filter((product: any) => {
      const matchesBySlug = product.styleSlug === slug;
      const matchesByName =
        typeof product.style === "string" && matchesStyleName(product.style);
      const matchesByArray =
        Array.isArray(product.style) &&
        product.style.some((s: string) => matchesStyleName(s));
      return matchesBySlug || matchesByName || matchesByArray;
    });

    filtered = filtered.map((product: any) => {
      let styleName = "Uncategorized";
      if (typeof product.style === "string") {
        styleName = product.style;
      } else if (Array.isArray(product.style) && product.style.length > 0) {
        styleName = product.style[0];
      }
      return {
        ...product,
        styleName,
      };
    });

    return {
      name: style.name,
      products: filtered,
    };
  } catch (error) {
    console.error("Error fetching style data:", error);
    return null;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const resolvedParams = await params;
  const { style } = resolvedParams;
  const data = await getStyleData(style);

  if (!data) {
    notFound();
  }

  const firstProduct = data.products[0];

  // Convert slug to readable style name (e.g., "luxury-style" to "Luxury Style")
  const styleName = style
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <ImageSection
        desktopSrc={`/styles/${style}-desktop.png`}
        mobileSrc={`/styles/${style}-mobile.png`}
        alt={styleName}
        collectionName={styleName}
        collectionSlug={style}
        shopNow={false}
      />
      <Wrapper>
        <section>
          {/* <h1 className="mb-6 text-3xl font-bold capitalize">{data.name}</h1> */}
          {firstProduct ? <ProductDetails foundData={firstProduct} /> : null}
          {/* <AllProductsClient products={data.products} showFilters={false} /> */}
        </section>
      </Wrapper>
    </>
  );
}
