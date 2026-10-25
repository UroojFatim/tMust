import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /api\nSitemap: ${SITE_URL}/sitemap.xml\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
