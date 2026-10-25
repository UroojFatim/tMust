import { getAllCollectionSlugs, getAllProductSlugs } from "@/lib/db/seo";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const buildUrlEntry = (loc: string, lastmod: string) => {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
};

export async function GET() {
  const [productSlugs, collectionSlugs] = await Promise.all([
    getAllProductSlugs(),
    getAllCollectionSlugs(),
  ]);

  const lastmod = new Date().toISOString();
  const staticUrls = [SITE_URL, `${SITE_URL}/all-products`];

  const urls = [
    ...staticUrls.map((url) => buildUrlEntry(url, lastmod)),
    ...collectionSlugs.map((slug: string) =>
      buildUrlEntry(`${SITE_URL}/collection/${slug}`, lastmod)
    ),
    ...productSlugs.map((slug: string) =>
      buildUrlEntry(`${SITE_URL}/product/${slug}`, lastmod)
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    "\n"
  )}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
