"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";

export default function InventoryProductsPage() {
  const { loading, authenticated } = useInventorySession();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        const productsList = data.products || [];
        setProducts(productsList);
        setFilteredProducts(productsList);
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
      setCurrentPage(1);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter((product) => {
        const titleMatch = product.title?.toLowerCase().includes(query);
        const collectionMatch = product.collection?.toLowerCase().includes(query);
        const styleMatch = Array.isArray(product.style) 
          ? product.style.some((s: string) => s.toLowerCase().includes(query))
          : false;
        const codeMatch = product.productCode?.toLowerCase().includes(query);
        return titleMatch || collectionMatch || styleMatch || codeMatch;
      });
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-7xl space-y-6">
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

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search products by title, collection, style, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Showing {currentProducts.length} of {filteredProducts.length} products
            {searchQuery && ` (filtered from ${products.length} total)`}
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
              {currentProducts.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    {searchQuery ? "No products found matching your search." : "No products yet."}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => {
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
