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
  const [togglingId, setTogglingId] = useState<string | null>(null);
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
        const styleValue = product.style;
        const styleMatch = Array.isArray(styleValue)
          ? styleValue.some((s: string) => s.toLowerCase().includes(query))
          : String(styleValue || "").toLowerCase().includes(query);
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

  const handleToggleVisibility = async (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    const currentStatus = product.displayOnWebsite !== false;
    const newStatus = !currentStatus;

    setTogglingId(productId);
    try {
      const response = await fetch(`/api/inventory/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayOnWebsite: newStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to update product visibility.");
        setTogglingId(null);
        return;
      }

      // Update product in state
      const updatedProducts = products.map((p) =>
        p._id === productId ? { ...p, displayOnWebsite: newStatus } : p
      );
      setProducts(updatedProducts);
      setFilteredProducts(filteredProducts.map((p) =>
        p._id === productId ? { ...p, displayOnWebsite: newStatus } : p
      ));
      setTogglingId(null);
    } catch (err) {
      setError("Failed to update product visibility.");
      setTogglingId(null);
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
    <div className="min-h-screen bg-slate-50 py-4 px-3 md:px-8 md:py-8">
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Products</h1>
            <p className="text-xs md:text-sm text-slate-500">All inventory products in MongoDB.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              href="/inventory"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm font-semibold text-slate-700 text-center hover:bg-slate-50 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/inventory/products/new"
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs md:text-sm font-semibold text-white text-center hover:bg-blue-700 transition"
            >
              Add Product
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl bg-white p-3 md:p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
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

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Collection</th>
                <th className="px-4 py-3">Styles</th>
                <th className="px-4 py-3">SKUs</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentProducts.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500 text-center" colSpan={7}>
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

                  const isDisplayed = product.displayOnWebsite !== false;

                  return (
                    <tr key={product._id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {product.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.collection || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {Array.isArray(product.style) && product.style.length
                          ? product.style.slice(0, 2).join(", ")
                          : product.style || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{skuCount}</td>
                      <td className="px-4 py-3 text-slate-600">{units}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isDisplayed
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isDisplayed ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleVisibility(product._id)}
                            disabled={togglingId === product._id}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                              isDisplayed
                                ? "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
                                : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {togglingId === product._id
                              ? "..."
                              : isDisplayed
                                ? "Hide"
                                : "Show"}
                          </button>
                          <Link
                            href={`/inventory/products/${product._id}`}
                            className="rounded-lg border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deletingId === product._id}
                            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {deletingId === product._id ? "..." : "Delete"}
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

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {currentProducts.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm text-center text-slate-500 text-sm">
              {searchQuery ? "No products found matching your search." : "No products yet."}
            </div>
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

              const isDisplayed = product.displayOnWebsite !== false;

              return (
                <div key={product._id} className="rounded-xl bg-white p-4 shadow-sm space-y-3 border border-slate-100">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                      {product.title}
                    </h3>
                  </div>

                  {/* Meta Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Collection</p>
                      <p className="font-medium text-slate-900">{product.collection || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">SKUs</p>
                      <p className="font-medium text-slate-900">{skuCount}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Units</p>
                      <p className="font-medium text-slate-900">{units}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Website</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          isDisplayed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isDisplayed ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  {/* Styles */}
                  {(Array.isArray(product.style) && product.style.length > 0) ||
                  product.style ? (
                    <div className="text-xs">
                      <p className="text-slate-500 mb-1">Styles</p>
                      <p className="text-slate-900 font-medium line-clamp-2">
                        {Array.isArray(product.style) && product.style.length
                          ? product.style.join(", ")
                          : product.style || "—"}
                      </p>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleVisibility(product._id)}
                      disabled={togglingId === product._id}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition w-full ${
                        isDisplayed
                          ? "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
                          : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {togglingId === product._id
                        ? "Updating..."
                        : isDisplayed
                          ? "Hide from Website"
                          : "Show on Website"}
                    </button>
                    <div className="flex gap-2">
                      <Link
                        href={`/inventory/products/${product._id}`}
                        className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {deletingId === product._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 md:p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50 transition"
            >
              ← Previous
            </button>

            {/* Page Numbers - Hide on very small screens, show on sm and up */}
            <div className="hidden xs:flex items-center justify-center gap-1 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-semibold ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Page Indicator on very small screens */}
            <div className="xs:hidden text-center text-xs text-slate-600">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
