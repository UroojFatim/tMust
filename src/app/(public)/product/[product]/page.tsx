import Wrapper from "@/components/shared/Wrapper";
import ProductDetails from "@/components/ProductDetails";
import { getProductBySlug } from "@/lib/db/seo";
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  SITE_URL,
  toAbsoluteUrl,
} from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface IVariant {
  color: string;
  images: Array<{ url: string; alt: string }>;
  sizes: Array<{
    size: string;
    quantity: number;
    priceDelta: number;
    sku: string;
    barcode: string;
    label: string;
  }>;
}

interface IProduct {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  productCode: string;
  collection: string;
  collectionSlug: string;
  style: string;
  styleSlug: string;
  tags: string[];
  details: Array<{
    key: string;
    valueHtml: string;
  }>;
  variants: IVariant[];
  images?: Array<{ url: string; alt: string }>;
  createdAt: string;
}
const getProductImages = (product: IProduct) => {
  const variantImages = (product.variants || []).flatMap(
    (variant) => variant.images || [],
  );
  const rootImages = (product as { images?: Array<{ url: string }> }).images;
  const allImages = [...(rootImages || []), ...variantImages];
  return allImages
    .map((img) => img?.url)
    .filter((url): url is string => Boolean(url));
};

const getProductSku = (product: IProduct) => {
  const sizeSku = product.variants
    ?.flatMap((variant) => variant.sizes || [])
    .find((size) => size?.sku)?.sku;
  return product.productCode || sizeSku || undefined;
};

const hasInventory = (product: IProduct) =>
  (product.variants || []).some((variant) =>
    (variant.sizes || []).some((size) => (size?.quantity ?? 0) > 0),
  );

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}): Promise<Metadata> {
  const { product: productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product) {
    return {
      title: `Product Not Found | ${BRAND_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const typedProduct = product as unknown as IProduct;
  const title = typedProduct.title || BRAND_NAME;
  const description =
    typedProduct.shortDescription ||
    typedProduct.description ||
    DEFAULT_DESCRIPTION;
  const images = getProductImages(typedProduct).map(toAbsoluteUrl);
  const canonical = `/product/${typedProduct.slug}`;

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
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product: productSlug } = await params;
  const rawProduct = (await getProductBySlug(productSlug)) as IProduct | null;

  if (!rawProduct) {
    notFound();
  }

  const foundData: IProduct = {
    ...rawProduct,
    _id: rawProduct._id?.toString?.() ?? rawProduct._id,
  } as IProduct;

  const productImages = getProductImages(foundData).map(toAbsoluteUrl);
  const productUrl = `${SITE_URL}/product/${foundData.slug}`;
  const collectionUrl = foundData.collectionSlug
    ? `${SITE_URL}/collection/${foundData.collectionSlug}`
    : SITE_URL;

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
      ...(foundData.collectionSlug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: foundData.collection || "Collection",
              item: collectionUrl,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: foundData.collectionSlug ? 3 : 2,
        name: foundData.title,
        item: productUrl,
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: foundData.title,
    description:
      foundData.shortDescription ||
      foundData.description ||
      DEFAULT_DESCRIPTION,
    image: productImages.length ? productImages : undefined,
    sku: getProductSku(foundData),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price: Number(foundData.basePrice ?? 0).toString(),
      availability: hasInventory(foundData)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Wrapper>
      {/* JSON-LD structured data for product SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <div className="pt-10 lg:pt-20">
        <ProductDetails foundData={foundData} />
      </div>
    </Wrapper>
  );
}
