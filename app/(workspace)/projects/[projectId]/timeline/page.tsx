"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, Clock, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Task {
  id: string;
  taskCode: string;
  title: string;
  status: string;
  assignedTo: string | null;
  durationDays: number;
  completedAt: string | null;
  penalties: { totalAmount: number }[];
  _count: { comments: number };
}

interface Week {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

interface Project {
  id: string;
  timelineWeeks: Week[];
  penaltyPerDay: number | null;
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

export default function TimelinePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Task updated");
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!project) return null;

  return (
    <div className="space-y-6">
      {project.timelineWeeks.map((week) => (
        <div key={week.id} className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="bg-[var(--muted)] px-4 py-3">
            <h3 className="font-semibold">Week {week.weekNumber}</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              {new Date(week.startDate).toLocaleDateString()} — {new Date(week.endDate).toLocaleDateString()}
            </p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                <th className="px-4 py-2 text-left w-16">Code</th>
                <th className="px-4 py-2 text-left">Task</th>
                <th className="px-4 py-2 text-left w-28">Assigned</th>
                <th className="px-4 py-2 text-center w-20">Status</th>
                <th className="px-4 py-2 text-center w-20">Days</th>
                <th className="px-4 py-2 text-center w-20">Chat</th>
                <th className="px-4 py-2 text-right w-24">Penalty</th>
                <th className="px-4 py-2 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {week.tasks.map((task) => {
                const Icon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
                const color = statusColors[task.status as keyof typeof statusColors] || "";
                const penalty = task.penalties.reduce((s, p) => s + p.totalAmount, 0);

                return (
                  <tr key={task.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--primary)]">
                      {task.taskCode}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${projectId}/tasks/${task.id}`}
                        className="font-medium hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {task.assignedTo || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={cn("flex items-center justify-center gap-1", color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{task.durationDays}d</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {task._count.comments > 0 && (
                        <Badge variant="default">{task._count.comments}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {penalty > 0 && (
                        <span className="text-red-500 font-medium">${penalty.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {task.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateTask.mutate({
                              taskId: task.id,
                              status: task.status === "NOT_STARTED" ? "IN_PROGRESS" : "COMPLETED",
                            })
                          }
                        >
                          {task.status === "NOT_STARTED" ? "Start" : "Complete"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {week.tasks.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
              No tasks in this week.
            </p>
          )}
        </div>
      ))}

      {project.timelineWeeks.length === 0 && (
        <p className="py-8 text-center text-[var(--muted-foreground)]">
          No timeline data. Convert a signed proposal to create the timeline.
        </p>
      )}
    </div>
  );
}
