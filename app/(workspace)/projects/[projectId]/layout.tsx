"use client";

import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

const tabs = [
  { href: "agreement", label: "Agreement" },
  { href: "timeline", label: "Timeline" },
  { href: "tasks", label: "Kanban" },
  { href: "checklist", label: "Checklist" },
  { href: "invoices", label: "Invoices" },
  { href: "files", label: "Files" },
];

const byHourTabs = [
  { href: "agreement", label: "Agreement" },
  { href: "requests", label: "Requests" },
  { href: "checklist", label: "Checklist" },
  { href: "invoices", label: "Invoices" },
  { href: "records", label: "Records" },
  { href: "files", label: "Files" },
];

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  client: { name: string } | null;
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeTabs = project?.type === "BY_HOUR" ? byHourTabs : tabs;
  const currentTab = pathname.split("/").pop();

  return (
    <div>
      {/* Project header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
          {project && (
            <>
              <Badge variant="outline">
                {project.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
              </Badge>
              <Badge
                variant={
                  project.status === "ACTIVE"
                    ? "success"
                    : project.status === "COMPLETED"
                      ? "primary"
                      : "warning"
                }
              >
                {project.status.replace("_", " ")}
              </Badge>
            </>
          )}
        </div>
        {project?.client && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Client: {project.client.name}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {activeTabs.map((tab) => (
          <Link
            key={tab.href}
            href={`/projects/${projectId}/${tab.href}`}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              currentTab === tab.href
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
