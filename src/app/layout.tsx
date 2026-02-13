import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_URL,
} from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: BRAND_NAME,
    title: BRAND_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} luxury clothing`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Organization structured data for site-wide SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
