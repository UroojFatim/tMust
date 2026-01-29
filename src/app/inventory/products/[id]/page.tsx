"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";
import { QRCodeCanvas } from "qrcode.react";

export default function InventoryProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { loading, authenticated } = useInventorySession();
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/inventory/products/${id}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data?.message || "Unable to load product.");
          setFetching(false);
          return;
        }
        const data = await response.json();
        setProduct(data.product);
        setFetching(false);
      } catch (err) {
        setError("Unable to load product.");
        setFetching(false);
      }
    };

    if (authenticated) {
      load();
    }
  }, [authenticated, id]);

  if (loading || fetching) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Sign in to view products.</p>
        <Link
          href="/inventory"
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{error || "Product not found."}</p>
        <Link
          href="/inventory/products"
          className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-sm text-slate-500">Product details</p>
        </div>
        <Link
          href="/inventory/products"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back to Products
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Basics</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Slug:</span> {product.slug}
            </div>
            <div>
              <span className="text-slate-500">Collection:</span>{" "}
              {product.collection || "—"}
            </div>
            <div>
              <span className="text-slate-500">Styles:</span>{" "}
              {Array.isArray(product.style) && product.style.length
                ? product.style.join(", ")
                : "—"}
            </div>
            <div>
              <span className="text-slate-500">Tags:</span>{" "}
              {Array.isArray(product.tags) && product.tags.length
                ? product.tags.join(", ")
                : "—"}
            </div>
            <div>
              <span className="text-slate-500">Product Code:</span>{" "}
              {product.productCode || "—"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Pricing</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Purchase Price:</span> ${
                Number(product.purchasePrice || 0).toFixed(2)
              }
            </div>
            <div>
              <span className="text-slate-500">Base Price:</span> ${
                Number(product.basePrice || 0).toFixed(2)
              }
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Short Description</h2>
        <p className="mt-2 text-sm text-slate-700">
          {product.shortDescription || "—"}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Detailed Description</h2>
        <div className="mt-3 space-y-3">
          {Array.isArray(product.details) && product.details.length ? (
            product.details.map((detail: any, index: number) => (
              <div key={index} className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-600">
                  {detail.key}
                </p>
                <div
                  className="prose prose-sm mt-2 max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: detail.valueHtml }}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No details added.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Variants</h2>
        <div className="mt-4 space-y-4">
          {Array.isArray(product.variants) && product.variants.length ? (
            product.variants.map((variant: any, index: number) => (
              <div key={index} className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Color: {variant.color || "—"}
                </p>
                {Array.isArray(variant.images) && variant.images.length ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {variant.images.map((img: any, imgIndex: number) => (
                      <div key={imgIndex} className="h-20 w-20 overflow-hidden rounded-lg border">
                        <img
                          src={img.url}
                          alt={img.alt || "Product image"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">No images.</p>
                )}
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Size</th>
                        <th className="px-3 py-2">Quantity</th>
                        <th className="px-3 py-2">Price Delta</th>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Barcode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.isArray(variant.sizes) && variant.sizes.length ? (
                        variant.sizes.map((size: any, sizeIndex: number) => (
                          <tr key={sizeIndex}>
                            <td className="px-3 py-2">{size.size || "—"}</td>
                            <td className="px-3 py-2">{size.quantity ?? 0}</td>
                            <td className="px-3 py-2">{size.priceDelta ?? 0}</td>
                            <td className="px-3 py-2">{size.sku || "—"}</td>
                            <td className="px-3 py-2">
                              {size.sku && size.barcode && product.slug ? (
                                <div className="group relative cursor-pointer">
                                  <QRCodeCanvas
                                    value={`${typeof window !== "undefined" ? window.location.origin : "https://tmust.com"}/product/${product.slug}`}
                                    size={64}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="M"
                                    includeMargin={false}
                                  />
                                  <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                                    SKU: {size.sku}
                                  </div>
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-slate-400" colSpan={5}>
                            No sizes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No variants added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
