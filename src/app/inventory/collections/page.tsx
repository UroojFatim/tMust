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

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSelectedStyles, setEditSelectedStyles] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleEdit = (collection: any) => {
    setEditingId(collection._id);
    setEditName(collection.name);
    setEditSelectedStyles(collection.styles || []);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      handleError("Collection name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/inventory/collections/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), styles: editSelectedStyles }),
      });

      const data = await response.json();
      if (!response.ok) {
        handleError(data?.message || "Failed to update collection.");
        return;
      }

      setCollections((prev) =>
        prev.map((c) =>
          c._id === editingId
            ? { ...c, name: editName.trim(), styles: editSelectedStyles }
            : c
        )
      );
      setEditingId(null);
      setEditName("");
      setEditSelectedStyles([]);
      handleSuccess("Collection Updated Successfully");
    } catch (err) {
      handleError("Failed to update collection.");
    } finally {
      setIsUpdating(false);
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
    <div className="min-h-screen bg-slate-50 py-4 px-3 md:py-8 md:px-8">
      <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Collections</h1>
            <p className="text-xs md:text-sm text-slate-500">Manage product collections.</p>
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
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Collection name"
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
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-slate-600">Styles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {styles.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No styles yet. Add them from{" "}
                    <Link href="/inventory/styles" className="text-blue-600 hover:underline">
                      Styles
                    </Link>
                    .
                  </p>
                ) : (
                  styles.map((style) => (
                    <label key={style._id} className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-xs md:text-sm">
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
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-slate-700 font-medium">{style.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </form>
          {error ? <p className="mt-3 text-xs md:text-sm text-red-600">{error}</p> : null}
        </div>

        {/* Search */}
        <div className="rounded-xl md:rounded-2xl bg-white p-4 md:p-6 shadow-sm">
          <input
            type="text"
            placeholder="Search collections..."
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
                <th className="px-4 py-3">Styles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCollections.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500 text-center" colSpan={4}>
                    {searchQuery ? "No collections match your search." : "No collections yet."}
                  </td>
                </tr>
              ) : (
                paginatedCollections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {collection.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{collection.slug}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">
                      {Array.isArray(collection.styles) && collection.styles.length
                        ? collection.styles.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(collection)}
                          className="rounded-lg border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(collection._id)}
                          disabled={deletingId === collection._id}
                          className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                        >
                          {deletingId === collection._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedCollections.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow-sm text-center text-slate-500 text-sm">
              {searchQuery ? "No collections match your search." : "No collections yet."}
            </div>
          ) : (
            paginatedCollections.map((collection) => (
              <div key={collection._id} className="rounded-xl bg-white p-4 shadow-sm space-y-3 border border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{collection.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Slug: {collection.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Styles</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {Array.isArray(collection.styles) && collection.styles.length
                      ? collection.styles.join(", ")
                      : "—"}
                  </p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(collection)}
                    className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(collection._id)}
                    disabled={deletingId === collection._id}
                    className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  >
                    {deletingId === collection._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredCollections.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl md:rounded-2xl bg-white p-3 md:p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="text-xs md:text-sm text-slate-500 order-3 md:order-1">
              Showing {paginatedCollections.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredCollections.length)} of {filteredCollections.length}
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

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Collection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter collection name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Styles
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {styles.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No styles available. Add them from{" "}
                      <Link href="/inventory/styles" className="text-blue-600">
                        Styles
                      </Link>
                      .
                    </p>
                  ) : (
                    styles.map((style) => (
                      <label key={style._id} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editSelectedStyles.includes(style.name)}
                          onChange={(e) => {
                            setEditSelectedStyles((prev) =>
                              e.target.checked
                                ? [...prev, style.name]
                                : prev.filter((v) => v !== style.name)
                            );
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm text-slate-700">{style.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditName("");
                  setEditSelectedStyles([]);
                }}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating || !editName.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
