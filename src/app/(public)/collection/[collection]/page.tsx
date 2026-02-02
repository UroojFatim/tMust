import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";
import { notFound } from "next/navigation";

async function getCollectionData(slug: string) {
  try {
    const [collectionsRes, stylesRes, productsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/collections`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/styles`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/products`, { cache: 'no-store' }),
    ]);

    const collectionsData = await collectionsRes.json();
    const stylesData = await stylesRes.json();
    const productsData = await productsRes.json();

    console.log("productsData",productsData)
    // Find matching collection or style
    const collection = collectionsData.collections?.find((c: any) => c.slug === slug);
    const style = stylesData.styles?.find((s: any) => s.slug === slug);

    if (!collection && !style) {
      return null;
    }

    const matchedItem = collection || style;
    const products = productsData.products || [];
    const allStyles = stylesData.styles || [];

    // Create a style lookup map
    const styleMap = new Map(allStyles.map((s: any) => [s._id, s.name]));

    console.log("Matched collection:", collection);
    console.log("Matched style:", styleMap);
    console.log("Total products:", products.length);
    console.log("Sample product:", products[0]);

    // Filter products by collection slug from URL
    let filtered = products;
    
    if (collection) {
      filtered = products.filter((product: any) => {
        // Try matching by collectionSlug first (new products)
        // Fall back to matching collection name with slug (old products)
        const matchesBySlug = product.collectionSlug === slug;
        const matchesByName = product.collection?.toLowerCase().replace(/\s+/g, '-') === slug;
        const matches = matchesBySlug || matchesByName;
        console.log(`Product ${product.title}: collectionSlug=${product.collectionSlug}, collection=${product.collection}, slug=${slug}, matches=${matches}`);
        return matches;
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

export async function generateStaticParams() {
  try {
    const [collectionsRes, stylesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/collections`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/styles`, { cache: 'no-store' }),
    ]);

    const collectionsData = await collectionsRes.json();
    const stylesData = await stylesRes.json();

    const params = [];

    if (collectionsData.collections) {
      params.push(...collectionsData.collections.map((c: any) => ({ collection: c.slug })));
    }

    if (stylesData.styles) {
      params.push(...stylesData.styles.map((s: any) => ({ collection: s.slug })));
    }

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function Page({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
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
