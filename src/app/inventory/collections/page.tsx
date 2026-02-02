"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";

export default function InventoryCollectionsPage() {
  const { loading, authenticated } = useInventorySession();
  const [collections, setCollections] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [styles, setStyles] = useState<any[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
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
        const [collectionsResponse, stylesResponse] = await Promise.all([
          fetch("/api/inventory/collections", { cache: "no-store" }),
          fetch("/api/inventory/styles", { cache: "no-store" }),
        ]);

        if (!collectionsResponse.ok) {
          setError("Unable to load collections.");
          setFetching(false);
          return;
        }

        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.collections || []);

        if (stylesResponse.ok) {
          const stylesData = await stylesResponse.json();
          setStyles(stylesData.styles || []);
        }
      } catch (err) {
        setError("Unable to load collections.");
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
      const response = await fetch("/api/inventory/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), styles: selectedStyles }),
      });

      const data = await response.json();
      if (!response.ok) {
        handleError(data?.message || "Unable to add collection.");
        return;
      }

      setCollections((prev) => [data.collection, ...prev]);
      setName("");
      setSelectedStyles([]);
      setSearchQuery("");
      setCurrentPage(1);
      handleSuccess("Collection Added Successfully");
    } catch (err) {
      handleError("Unable to add collection.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (collectionId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this collection?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setDeletingId(collectionId);
    try {
      const response = await fetch(`/api/inventory/collections/${collectionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        handleError(data?.message || "Failed to delete collection.");
        setDeletingId(null);
        return;
      }

      setCollections((prev) => prev.filter((c) => c._id !== collectionId));
      handleSuccess("Collection Deleted Successfully");
    } catch (err) {
      handleError("Failed to delete collection.");
    } finally {
      setDeletingId(null);
    }
  };

  // Search and filter logic
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCollections = filteredCollections.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading || fetching) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Sign in to manage collections.</p>
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
            <h1 className="text-2xl font-semibold">Collections</h1>
            <p className="text-sm text-slate-500">Manage product collections.</p>
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
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Collection name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Adding..." : "Add Collection"}
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Styles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {styles.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No styles yet. Add them from{" "}
                    <Link href="/inventory/styles" className="text-blue-600">
                      Styles
                    </Link>
                    .
                  </p>
                ) : (
                  styles.map((style) => (
                    <label key={style._id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStyles.includes(style.name)}
                        onChange={(event) => {
                          setSelectedStyles((prev) =>
                            event.target.checked
                              ? [...prev, style.name]
                              : prev.filter((value) => value !== style.name)
                          );
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm text-slate-700 font-medium">{style.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search collections by name..."
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
                <th className="px-4 py-3">Styles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    {searchQuery ? "No collections match your search." : "No collections yet."}
                  </td>
                </tr>
              ) : (
                paginatedCollections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {collection.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{collection.slug}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {Array.isArray(collection.styles) && collection.styles.length
                        ? collection.styles.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(collection._id)}
                        disabled={deletingId === collection._id}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                      >
                        {deletingId === collection._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredCollections.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <div className="text-xs text-slate-500">
                Showing {paginatedCollections.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredCollections.length)} of {filteredCollections.length}
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
