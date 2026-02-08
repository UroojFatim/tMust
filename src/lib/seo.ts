export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tmustt.com";
export const BRAND_NAME = "TMUSTT";
export const DEFAULT_DESCRIPTION =
  "TMUSTT is a luxury clothing brand offering curated collections with refined craftsmanship and modern elegance.";
export const DEFAULT_OG_IMAGE = "/hero/luxurycollectiondesktop.jpg";

export const toAbsoluteUrl = (pathOrUrl: string) => {
  const value = (pathOrUrl ?? "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const prefix = value.startsWith("/") ? "" : "/";
  return `${SITE_URL}${prefix}${value}`;
};
