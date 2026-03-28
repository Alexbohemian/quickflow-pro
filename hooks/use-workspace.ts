"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  memberCount: number;
}

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return res.json();
    },
  });
}

export function useCurrentWorkspace(workspaceId: string | null) {
  const setWorkspace = useAuthStore((s) => s.setWorkspace);

  const query = useQuery<Workspace>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch workspace");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (query.data) {
      setWorkspace(
        query.data.id,
        query.data.slug,
        query.data.role as "OWNER" | "ADMIN" | "PM" | "FINANCE" | "TEAM_MEMBER" | "CLIENT"
      );
    }
  }, [query.data, setWorkspace]);

  return query;
}
