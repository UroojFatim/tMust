"use client";

import { useCallback, useEffect, useState } from "react";

export type InventorySessionState = {
  loading: boolean;
  authenticated: boolean;
  username?: string;
};

export function useInventorySession() {
  const [state, setState] = useState<InventorySessionState>({
    loading: true,
    authenticated: false,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const response = await fetch("/api/inventory/session", {
      cache: "no-store",
    });
    const data = await response.json();
    setState({
      loading: false,
      authenticated: Boolean(data.authenticated),
      username: data.username,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
