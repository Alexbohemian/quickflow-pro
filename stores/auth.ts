import { create } from "zustand";
import type { WorkspaceRole } from "@/types";

interface AuthStore {
  workspaceId: string | null;
  workspaceSlug: string | null;
  role: WorkspaceRole | null;
  setWorkspace: (id: string, slug: string, role: WorkspaceRole) => void;
  clearWorkspace: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  workspaceId: null,
  workspaceSlug: null,
  role: null,
  setWorkspace: (id, slug, role) =>
    set({ workspaceId: id, workspaceSlug: slug, role }),
  clearWorkspace: () =>
    set({ workspaceId: null, workspaceSlug: null, role: null }),
}));
