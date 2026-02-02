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
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Styles</h1>
            <p className="text-sm text-slate-500">Manage product styles.</p>
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

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Style name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Adding..." : "Add Style"}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search styles by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStyles.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={3}>
                    {searchQuery ? "No styles match your search." : "No styles yet."}
                  </td>
                </tr>
              ) : (
                paginatedStyles.map((style) => (
                  <tr key={style._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {style.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{style.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(style._id)}
                        disabled={deletingId === style._id}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                      >
                        {deletingId === style._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredStyles.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <div className="text-xs text-slate-500">
                Showing {paginatedStyles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredStyles.length)} of {filteredStyles.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
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
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
