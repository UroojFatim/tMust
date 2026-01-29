"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";

const statCards = [
  {
    key: "totalProducts",
    label: "Total Products",
    icon: "📦",
    color: "bg-blue-500",
  },
  {
    key: "totalSkus",
    label: "Total SKUs",
    icon: "🗂️",
    color: "bg-emerald-500",
  },
  {
    key: "unitsOnHand",
    label: "Units on Hand",
    icon: "🛒",
    color: "bg-purple-500",
  },
  {
    key: "lowStockItems",
    label: "Low Stock Items",
    icon: "⚠️",
    color: "bg-red-500",
  },
  {
    key: "totalSales",
    label: "Total Sales",
    icon: "💵",
    color: "bg-green-500",
  },
  {
    key: "totalProfit",
    label: "Total Profit",
    icon: "📈",
    color: "bg-indigo-500",
  },
];

export default function InventoryDashboardPage() {
  const { loading, authenticated, username, refresh } = useInventorySession();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

  const fetchStats = useCallback(async () => {
    const response = await fetch("/api/inventory/summary", {
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = await response.json();
    setStats(data.totals || {});
    setStatsLoaded(true);
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSigningIn(true);

    try {
      const response = await fetch("/api/inventory/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.message || "Login failed");
        return;
      }

      await refresh();
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/inventory/logout", { method: "POST" });
    await refresh();
  };

  useEffect(() => {
    if (authenticated && !statsLoaded) {
      fetchStats();
    }
  }, [authenticated, statsLoaded, fetchStats]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              TMUST Inventory
            </h1>
            <p className="text-sm text-slate-500">
              Sign in with your admin credentials to manage stock.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Username
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.username}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value }))
                }
                placeholder="admin"
                autoComplete="username"
                disabled={signingIn}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Password
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={signingIn}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={signingIn}
            >
              {signingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">TMUST Inventory</h1>
            <p className="text-sm text-slate-500">
              Manage your clothing inventory
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
          >
            Sign out
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {card.key === "totalSales" || card.key === "totalProfit"
                    ? `$${Number(stats[card.key] || 0).toFixed(2)}`
                    : typeof stats[card.key] === "number"
                      ? stats[card.key]
                      : 0}
                </p>
                {card.key === "totalSales" ? (
                  <p className="text-xs text-slate-400">
                    {stats.transactions ?? 0} transactions
                  </p>
                ) : null}
                {card.key === "totalProfit" ? (
                  <p className="text-xs text-slate-400">Profitable</p>
                ) : null}
                {card.key === "lowStockItems" ? (
                  <p className="text-xs text-slate-400">Needs attention</p>
                ) : null}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${card.color}`}
              >
                <span className="text-xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <span>⚡</span>
            <h2>Quick Actions</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/inventory/products/new"
              className="flex flex-col items-center justify-center rounded-xl bg-blue-600 px-4 py-6 text-sm font-semibold text-white shadow"
            >
              <span className="text-xl">＋</span>
              Add Product
            </Link>
            <button className="rounded-xl bg-emerald-600 px-4 py-6 text-sm font-semibold text-white shadow">
              Scan Barcode
            </button>
            <button className="rounded-xl bg-purple-600 px-4 py-6 text-sm font-semibold text-white shadow">
              Stock Movement
            </button>
            <button className="rounded-xl bg-indigo-600 px-4 py-6 text-sm font-semibold text-white shadow">
              Reports
            </button>
          </div>
        </div>

        <Link
          href="/inventory/products"
          className="block rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 shadow-sm"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
}
