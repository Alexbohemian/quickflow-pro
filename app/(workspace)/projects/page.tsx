"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { FolderKanban } from "lucide-react";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  client: { id: string; name: string } | null;
  startDate: string | null;
  endDate: string | null;
  _count: { timelineWeeks: number; invoices: number };
}

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "destructive"> = {
  PENDING_PAYMENT: "warning",
  ACTIVE: "success",
  ON_HOLD: "default",
  COMPLETED: "primary",
  CANCELLED: "destructive",
};

export default function ProjectsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("all");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects", tab],
    queryFn: async () => {
      const params = tab !== "all" ? `?type=${tab}` : "";
      const res = await fetch(`/api/projects${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>

      <Tabs
        tabs={[
          { value: "all", label: "All" },
          { value: "BY_TIMELINE", label: "Timeline" },
          { value: "BY_HOUR", label: "By Hour" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6 w-fit"
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No projects yet"
          description="Projects are created when proposals are signed and paid."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/projects/${project.id}/agreement`)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  {project.client && (
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar name={project.client.name} size="sm" />
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {project.client.name}
                      </span>
                    </div>
                  )}
                </div>
                <Badge variant={statusVariant[project.status]}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {project.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
                </Badge>
                {project._count.timelineWeeks > 0 && (
                  <Badge variant="outline">
                    {project._count.timelineWeeks} weeks
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
