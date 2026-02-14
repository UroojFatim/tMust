import Wrapper from "@/components/shared/Wrapper";
import AllProductsClient from "@/components/AllProductsClient";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/mongodb";
import { getCollectionBySlug } from "@/lib/db/seo";
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_URL,
} from "@/lib/seo";
import type { Metadata } from "next";
import ImageSection from "@/views/ImageSection";

async function getCollectionData(slug: string) {
  try {
    const db = await getDatabase();

    // Fetch all data from MongoDB directly
    const [collections, styles, products] = await Promise.all([
      db
        .collection("inventory_collections")
        .find({})
        .sort({ name: 1 })
        .toArray(),
      db.collection("inventory_styles").find({}).sort({ name: 1 }).toArray(),
      db
        .collection("inventory_products")
        .find({
          $or: [{ displayOnWebsite: { $exists: false } }, { displayOnWebsite: true }],
        })
        .sort({ createdAt: -1 })
        .toArray(),
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
        const matchesByName =
          product.collection?.toLowerCase().replace(/\s+/g, "-") === slug;
        return matchesBySlug || matchesByName;
      });
    }

    // Add style names - handle both string and array (old products)
    filtered = filtered.map((product: any) => {
      let styleName = "Uncategorized";
      if (typeof product.style === "string") {
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

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: collectionSlug } = await params;
  const collection = await getCollectionBySlug(collectionSlug);

  if (!collection) {
    return {
      title: `Collection Not Found | ${BRAND_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const title = collection.name || BRAND_NAME;
  const description =
    collection.shortDescription ||
    collection.description ||
    DEFAULT_DESCRIPTION;
  const canonical = `/collection/${collection.slug || collectionSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: collectionSlug } = await params;
  const data = await getCollectionData(collectionSlug);

  if (!data) {
    notFound();
  }

  const collectionUrl = `${SITE_URL}/collection/${collectionSlug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: data.name,
        item: collectionUrl,
      },
    ],
  };

  // Convert slug to readable collection name (e.g., "luxury-collection" to "Luxury Collection")
  const collectionName = collectionSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <ImageSection
        desktopSrc={`/collections/${collectionSlug}-desktop.png`}
        mobileSrc={`/collections/${collectionSlug}-mobile.png`}
        alt={collectionName}
        collectionName={collectionName}
        collectionSlug={collectionSlug}
        shopNow={false}
      />
      <Wrapper>
        {/* JSON-LD structured data for collection breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
        <section className="py-16">
          {/* <h1 className="text-3xl font-bold mb-6 capitalize">
          {data.name}
        </h1> */}
          <AllProductsClient products={data.products} />
        </section>
      </Wrapper>
    </>
  );
}
