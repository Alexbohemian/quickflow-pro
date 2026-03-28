"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import type { KanbanColumn } from "@/types";

interface Task {
  id: string;
  taskCode: string;
  title: string;
  status: string;
  assignedTo: string | null;
}

interface Week {
  tasks: Task[];
}

interface Project {
  id: string;
  timelineWeeks: Week[];
  kanbanCards: KanbanCard[];
}

interface KanbanCard {
  id: string;
  taskId: string | null;
  title: string;
  column: KanbanColumn;
  assignedTo: string | null;
}

const COLUMNS: { value: KanbanColumn; label: string; color: string }[] = [
  { value: "BACKLOG", label: "Backlog", color: "bg-gray-400" },
  { value: "TODO", label: "To Do", color: "bg-blue-400" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-400" },
  { value: "READY_TO_TEST", label: "Ready to Test", color: "bg-green-400" },
];

export default function KanbanPage() {
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

  // Map timeline tasks to kanban columns based on their status
  const allTasks = project?.timelineWeeks.flatMap((w) => w.tasks) || [];

  function getColumnTasks(column: KanbanColumn): Task[] {
    const statusMap: Record<KanbanColumn, string[]> = {
      BACKLOG: ["NOT_STARTED"],
      TODO: [],
      IN_PROGRESS: ["IN_PROGRESS"],
      READY_TO_TEST: ["COMPLETED"],
    };
    return allTasks.filter((t) => statusMap[column]?.includes(t.status));
  }

  const updateTaskStatus = useMutation({
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
    },
  });

  function handleDrop(column: KanbanColumn, taskId: string) {
    const statusMap: Record<KanbanColumn, string> = {
      BACKLOG: "NOT_STARTED",
      TODO: "NOT_STARTED",
      IN_PROGRESS: "IN_PROGRESS",
      READY_TO_TEST: "COMPLETED",
    };
    updateTaskStatus.mutate({ taskId, status: statusMap[column] });
    toast.success("Task moved");
  }

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const tasks = getColumnTasks(col.value);
        return (
          <div
            key={col.value}
            className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("taskId");
              if (taskId) handleDrop(col.value, taskId);
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${col.color}`} />
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {tasks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                  className="cursor-grab rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm hover:shadow-md active:cursor-grabbing"
                >
                  <Link href={`/projects/${projectId}/tasks/${task.id}`}>
                    <span className="font-mono text-xs font-bold text-[var(--primary)]">
                      {task.taskCode}
                    </span>
                    <p className="mt-1 text-sm font-medium">{task.title}</p>
                    {task.assignedTo && (
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {task.assignedTo}
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
