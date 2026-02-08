import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";

async function getStyleData(slug: string) {
  try {
    const db = await getDatabase();

    const [styles, products] = await Promise.all([
      db.collection("inventory_styles").find({}).sort({ name: 1 }).toArray(),
      db.collection("inventory_products").find({}).sort({ createdAt: -1 }).toArray(),
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
      basePrice: p.basePrice,
      productCode: p.productCode,
      collection: p.collection,
      collectionSlug: p.collectionSlug,
      style: p.style,
      styleSlug: p.styleSlug,
      variants: p.variants,
      images: p.images,
      createdAt: p.createdAt,
    }));

    const style = stylesData.find((s: any) => s.slug === slug);
    if (!style) {
      return null;
    }

    const matchesStyleName = (value?: string) =>
      value?.toLowerCase().replace(/\s+/g, "-") === slug;

    let filtered = productsData.filter((product: any) => {
      const matchesBySlug = product.styleSlug === slug;
      const matchesByName = typeof product.style === "string" && matchesStyleName(product.style);
      const matchesByArray = Array.isArray(product.style) && product.style.some((s: string) => matchesStyleName(s));
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

export default async function Page({ params }: { params: Promise<{ style: string }> }) {
  const resolvedParams = await params;
  const { style } = resolvedParams;
  const data = await getStyleData(style);

  if (!data) {
    notFound();
  }

  return (
    <Wrapper>
      <section className="py-32">
        {/* <h1 className="mb-6 text-3xl font-bold capitalize">{data.name}</h1> */}
        <AllProductsClient products={data.products} />
      </section>
    </Wrapper>
  );
}