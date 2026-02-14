"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";

export default function InventoryStylesPage() {
  const { loading, authenticated } = useInventorySession();
  const [styles, setStyles] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSuccess = (message: string) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      confirmButtonColor: "#10b981",
    });
  };

  const handleError = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      confirmButtonColor: "#ef4444",
    });
  };

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const response = await fetch("/api/inventory/styles", {
          cache: "no-store",
        });
        if (!response.ok) {
          setError("Unable to load styles.");
          setFetching(false);
          return;
        }
        const data = await response.json();
        setStyles(data.styles || []);
      } catch (err) {
        setError("Unable to load styles.");
      } finally {
        setFetching(false);
      }
    };

    if (authenticated) {
      load();
    }
  }, [authenticated]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/inventory/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        handleError(data?.message || "Unable to add style.");
        return;
      }

      setStyles((prev) => [data.style, ...prev]);
      setName("");
      setSearchQuery("");
      setCurrentPage(1);
      handleSuccess("Style Added Successfully");
    } catch (err) {
      handleError("Unable to add style.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (styleId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this style?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setDeletingId(styleId);
    try {
      const response = await fetch(`/api/inventory/styles/${styleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        handleError(data?.message || "Failed to delete style.");
        setDeletingId(null);
        return;
      }

      setStyles((prev) => prev.filter((s) => s._id !== styleId));
      handleSuccess("Style Deleted Successfully");
    } catch (err) {
      handleError("Failed to delete style.");
    } finally {
      setDeletingId(null);
    }
  };

  // Search and filter logic
  const filteredStyles = styles.filter((style) =>
    style.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStyles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStyles = filteredStyles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading || fetching) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Sign in to manage styles.</p>
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
    <div className="min-h-screen bg-slate-50 py-4 px-3 md:py-8 md:px-8">
      <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Styles</h1>
            <p className="text-xs md:text-sm text-slate-500">Manage product styles.</p>
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

        {/* Form */}
        <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-6 shadow-sm">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Style name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 transition"
            >
              {creating ? "Adding..." : "Add"}
            </button>
          </form>
          {error ? <p className="mt-3 text-xs md:text-sm text-red-600">{error}</p> : null}
        </div>

        {/* Search */}
        <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-6 shadow-sm">
          <input
            type="text"
            placeholder="Search styles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStyles.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500 text-center" colSpan={3}>
                    {searchQuery ? "No styles match your search." : "No styles yet."}
                  </td>
                </tr>
              ) : (
                paginatedStyles.map((style) => (
                  <tr key={style._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {style.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{style.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(style._id)}
                        disabled={deletingId === style._id}
                        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                      >
                        {deletingId === style._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedStyles.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow-sm text-center text-slate-500 text-sm">
              {searchQuery ? "No styles match your search." : "No styles yet."}
            </div>
          ) : (
            paginatedStyles.map((style) => (
              <div key={style._id} className="rounded-xl bg-white p-4 shadow-sm space-y-3 border border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{style.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Slug: {style.slug}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDelete(style._id)}
                    disabled={deletingId === style._id}
                    className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  >
                    {deletingId === style._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredStyles.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl md:rounded-2xl bg-white p-3 md:p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="text-xs md:text-sm text-slate-500 order-3 md:order-1">
              Showing {paginatedStyles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredStyles.length)} of {filteredStyles.length}
            </div>
            <div className="flex gap-2 order-1 md:order-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition flex-1"
              >
                ← Prev
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition flex-1"
              >
                Next →
              </button>
            </div>
            <div className="hidden xs:flex items-center justify-center gap-1 flex-wrap order-2 md:order-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
