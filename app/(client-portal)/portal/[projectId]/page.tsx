"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  taskCode: string;
  title: string;
  status: string;
  durationDays: number;
  _count: { comments: number };
}

interface Week {
  weekNumber: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  timelineWeeks: Week[];
}

const statusIcons = {
  NOT_STARTED: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  EXPIRED: AlertTriangle,
};

const statusColors = {
  NOT_STARTED: "text-[var(--muted-foreground)]",
  IN_PROGRESS: "text-blue-500",
  COMPLETED: "text-green-500",
  EXPIRED: "text-red-500",
};

export default function ClientProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [tab, setTab] = useState("timeline");

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["client-project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/portal/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!project) return null;

  const allTasks = project.timelineWeeks.flatMap((w) => w.tasks);
  const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
  const progress = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="mt-2 flex gap-2">
          <Badge variant={project.status === "ACTIVE" ? "success" : "warning"}>
            {project.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline">
            {project.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="mb-6">
        <CardTitle className="mb-2">Project Progress</CardTitle>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm">
            <span>{completed} of {allTasks.length} tasks completed</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs
        tabs={[
          { value: "timeline", label: "Timeline" },
          { value: "files", label: "Files" },
          { value: "invoices", label: "Invoices" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6 w-fit"
      />

      {tab === "timeline" && (
        <div className="space-y-4">
          {project.timelineWeeks.map((week) => (
            <Card key={week.weekNumber}>
              <CardTitle className="mb-3">Week {week.weekNumber}</CardTitle>
              <div className="space-y-2">
                {week.tasks.map((task) => {
                  const Icon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
                  const color = statusColors[task.status as keyof typeof statusColors] || "";
                  return (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--muted)]">
                      <Icon className={cn("h-5 w-5", color)} />
                      <span className="font-mono text-xs font-bold text-[var(--primary)]">{task.taskCode}</span>
                      <span className="flex-1 text-sm">{task.title}</span>
                      <Badge variant="outline">{task.durationDays}d</Badge>
                      {task._count.comments > 0 && (
                        <Badge>{task._count.comments} msg</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "files" && (
        <Card>
          <p className="text-sm text-[var(--muted-foreground)]">
            Files will be available here once uploaded by the team.
          </p>
        </Card>
      )}

      {tab === "invoices" && (
        <Card>
          <p className="text-sm text-[var(--muted-foreground)]">
            Your invoices will appear here.
          </p>
        </Card>
      )}
    </div>
  );
}
