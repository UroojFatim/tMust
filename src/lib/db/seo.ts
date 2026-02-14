import { getDatabase } from "@/lib/mongodb";

type SlugDoc = {
  slug?: string;
};

export const getProductBySlug = async (slug: string) => {
  if (!slug) return null;
  const db = await getDatabase();
  return db.collection("inventory_products").findOne({
    slug,
    $or: [{ displayOnWebsite: { $exists: false } }, { displayOnWebsite: true }],
  });
};

export const getCollectionBySlug = async (slug: string) => {
  if (!slug) return null;
  const db = await getDatabase();
  return db.collection("inventory_collections").findOne({ slug });
};

export const getAllProductSlugs = async () => {
  const db = await getDatabase();
  const results = await db
    .collection<SlugDoc>("inventory_products")
    .find(
      {
        slug: { $type: "string" },
        $or: [{ displayOnWebsite: { $exists: false } }, { displayOnWebsite: true }],
      },
      { projection: { slug: 1, _id: 0 } }
    )
    .toArray();

  return results
    .map((item: { slug?: string }) => item.slug)
    .filter((slug: string | undefined): slug is string => Boolean(slug));
};

export const getAllCollectionSlugs = async () => {
  const db = await getDatabase();
  const results = await db
    .collection<SlugDoc>("inventory_collections")
    .find({ slug: { $type: "string" } }, { projection: { slug: 1, _id: 0 } })
    .toArray();

  return results
    .map((item: { slug?: string }) => item.slug)
    .filter((slug: string | undefined): slug is string => Boolean(slug));
};
