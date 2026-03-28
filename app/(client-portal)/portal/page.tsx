"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
}

export default function ClientDashboard() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["client-projects"],
    queryFn: async () => {
      const res = await fetch("/api/portal/projects");
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Projects</h1>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No projects yet"
          description="Your projects will appear here once proposals are signed."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/portal/${project.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <Badge variant="outline" className="mt-2">
                      {project.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
                    </Badge>
                  </div>
                  <Badge
                    variant={project.status === "ACTIVE" ? "success" : "warning"}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
