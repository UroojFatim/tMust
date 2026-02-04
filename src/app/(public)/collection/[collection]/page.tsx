import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";

async function getCollectionData(slug: string) {
  try {
    const db = await getDatabase();
    
    // Fetch all data from MongoDB directly
    const [collections, styles, products] = await Promise.all([
      db.collection("inventory_collections").find({}).sort({ name: 1 }).toArray(),
      db.collection("inventory_styles").find({}).sort({ name: 1 }).toArray(),
      db.collection("inventory_products").find({}).sort({ createdAt: -1 }).toArray(),
    ]);

    // Serialize MongoDB data
    const collectionsData = collections.map((c: any) => ({
      _id: c._id?.toString(),
      name: c.name,
      slug: c.slug,
    }));

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

    // Find matching collection or style
    const collection = collectionsData.find((c: any) => c.slug === slug);
    const style = stylesData.find((s: any) => s.slug === slug);
    const matchedItem = collection || style;

    if (!matchedItem) {
      return null;
    }

    // Create a style lookup map
    const styleMap = new Map(stylesData.map((s: any) => [s._id, s.name]));

    // Filter products by collection slug from URL
    let filtered = productsData;
    
    if (collection) {
      filtered = productsData.filter((product: any) => {
        // Try matching by collectionSlug first (new products)
        // Fall back to matching collection name with slug (old products)
        const matchesBySlug = product.collectionSlug === slug;
        const matchesByName = product.collection?.toLowerCase().replace(/\s+/g, '-') === slug;
        return matchesBySlug || matchesByName;
      });
    }

    // Add style names - handle both string and array (old products)
    filtered = filtered.map((product: any) => {
      let styleName = "Uncategorized";
      if (typeof product.style === 'string') {
        styleName = product.style;
      } else if (Array.isArray(product.style) && product.style.length > 0) {
        styleName = product.style[0];
      }
      return {
        ...product,
        styleName: styleName,
      };
    });

    console.log("Filtered products count:", filtered.length);

    return {
      name: matchedItem.name,
      products: filtered,
    };
  } catch (error) {
    console.error("Error fetching collection data:", error);
    return null;
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ collection: string }> }) {
  const resolvedParams = await params;
  const { collection } = resolvedParams;
  const data = await getCollectionData(collection);

  if (!data) {
    notFound();
  }

  return (
    <Wrapper>
      <section className="py-32">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {data.name}
        </h1>
        <AllProductsClient products={data.products} />
      </section>
    </Wrapper>
  );
}
