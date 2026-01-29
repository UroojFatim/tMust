"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";

export default function InventoryProductsPage() {
  const { loading, authenticated } = useInventorySession();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const response = await fetch("/api/inventory/products", {
          cache: "no-store",
        });
        if (!response.ok) {
          setError("Unable to load products.");
          setFetching(false);
          return;
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError("Unable to load products.");
      } finally {
        setFetching(false);
      }
    };

    if (authenticated) {
      load();
    }
  }, [authenticated]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setDeletingId(productId);
    try {
      const response = await fetch(`/api/inventory/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to delete product.");
        setDeletingId(null);
        return;
      }
      // Remove product from state
      setProducts(products.filter((p) => p._id !== productId));
      setDeletingId(null);
    } catch (err) {
      setError("Failed to delete product.");
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (fetching) {
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

  return (
    <div className="space-y-6 mt-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-slate-500">All inventory products in MongoDB.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/inventory"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to Home
          </Link>
          <Link
            href="/inventory/products/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Add Product
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Styles</th>
              <th className="px-4 py-3">SKUs</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const variants = Array.isArray(product.variants)
                  ? product.variants
                  : [];
                let skuCount = 0;
                let units = 0;
                for (const variant of variants) {
                  const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];
                  skuCount += sizes.length;
                  for (const size of sizes) {
                    units += Number(size.quantity || 0);
                  }
                }

                return (
                  <tr key={product._id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {product.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.collection || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {Array.isArray(product.style) && product.style.length
                        ? product.style.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{skuCount}</td>
                    <td className="px-4 py-3 text-slate-600">{units}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/inventory/products/${product._id}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === product._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
