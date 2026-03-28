"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string;
  memberCount: number;
  members: { user: { id: string; name: string | null; image: string | null } }[];
}

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function selectWorkspace(workspaceId: string) {
    await fetch(`/api/workspaces/${workspaceId}/select`, { method: "POST" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold">Welcome back!</h1>
        <p className="mb-8 text-center text-[var(--muted-foreground)]">
          Select a workspace to continue
        </p>

        <div className="grid gap-4">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => selectWorkspace(ws.id)}
            >
              <div className="flex items-center gap-4">
                <Avatar name={ws.name} size="lg" src={ws.logo} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{ws.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""} &middot; {ws.role}
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {ws.members.slice(0, 4).map((m) => (
                    <Avatar
                      key={m.user.id}
                      src={m.user.image}
                      name={m.user.name || ""}
                      size="sm"
                      className="border-2 border-[var(--background)]"
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="h-auto py-6"
            onClick={() => router.push("/create-workspace")}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Another Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
