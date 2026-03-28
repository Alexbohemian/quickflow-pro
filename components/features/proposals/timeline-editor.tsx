"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface TimelineTask {
  id: string;
  taskCode: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  durationDays: number;
  dayStart: number;
  dependsOnId: string | null;
  dependsOn: { id: string; taskCode: string } | null;
}

interface TimelineWeek {
  id: string;
  weekNumber: number;
  tasks: TimelineTask[];
}

interface TimelineEditorProps {
  proposalId: string;
}

export function TimelineEditor({ proposalId }: TimelineEditorProps) {
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const { data: weeks = [], isLoading } = useQuery<TimelineWeek[]>({
    queryKey: ["proposal-timeline", proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}/timeline`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const timelineMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/proposals/${proposalId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["proposal-timeline", proposalId],
      });
    },
    onError: () => toast.error("Failed to update timeline"),
  });

  const allTasks = weeks.flatMap((w) => w.tasks);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weeks.map((week) => (
        <div
          key={week.id}
          className="rounded-lg border border-[var(--border)] overflow-hidden"
        >
          {/* Week header */}
          <div className="flex items-center justify-between bg-[var(--muted)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h3 className="font-semibold">Week {week.weekNumber}</h3>
              <Badge variant="outline">{week.tasks.length} tasks</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  timelineMutation.mutate({
                    action: "addTask",
                    weekId: week.id,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Task
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (week.tasks.length === 0) {
                    timelineMutation.mutate({
                      action: "deleteWeek",
                      weekId: week.id,
                    });
                  } else {
                    toast.error("Remove all tasks first");
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Task table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-3 py-2 text-left font-medium w-16">Code</th>
                  <th className="px-3 py-2 text-left font-medium">Task</th>
                  <th className="px-3 py-2 text-left font-medium w-32">Assigned To</th>
                  <th className="px-3 py-2 text-center font-medium w-20">Duration</th>
                  <th className="px-3 py-2 text-center font-medium w-20">Day</th>
                  <th className="px-3 py-2 text-left font-medium w-28">Depends On</th>
                  {/* Day columns */}
                  {[1, 2, 3, 4, 5].map((d) => (
                    <th key={d} className="px-2 py-2 text-center font-medium w-10">
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {week.tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[var(--primary)]">
                      {task.taskCode}
                    </td>
                    <td className="px-3 py-2">
                      {editingTask === task.id ? (
                        <Input
                          defaultValue={task.title}
                          className="h-7 text-sm"
                          autoFocus
                          onBlur={(e) => {
                            timelineMutation.mutate({
                              action: "updateTask",
                              taskId: task.id,
                              title: e.target.value,
                            });
                            setEditingTask(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => setEditingTask(task.id)}
                          className="text-left hover:underline"
                        >
                          {task.title}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">
                      {task.assignedTo || "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <select
                        value={task.durationDays}
                        onChange={(e) =>
                          timelineMutation.mutate({
                            action: "updateTask",
                            taskId: task.id,
                            durationDays: parseInt(e.target.value),
                          })
                        }
                        className="h-7 w-14 rounded border border-[var(--border)] bg-transparent text-center text-xs"
                      >
                        {[1, 2, 3, 4, 5].map((d) => (
                          <option key={d} value={d}>{d}d</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <select
                        value={task.dayStart}
                        onChange={(e) =>
                          timelineMutation.mutate({
                            action: "updateTask",
                            taskId: task.id,
                            dayStart: parseInt(e.target.value),
                          })
                        }
                        className="h-7 w-14 rounded border border-[var(--border)] bg-transparent text-center text-xs"
                      >
                        {[1, 2, 3, 4, 5].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={task.dependsOnId || ""}
                        onChange={(e) =>
                          timelineMutation.mutate({
                            action: "updateTask",
                            taskId: task.id,
                            dependsOnId: e.target.value || null,
                          })
                        }
                        className="h-7 w-24 rounded border border-[var(--border)] bg-transparent text-xs"
                      >
                        <option value="">None</option>
                        {allTasks
                          .filter((t) => t.id !== task.id)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.taskCode}
                            </option>
                          ))}
                      </select>
                    </td>
                    {/* Visual day indicators */}
                    {[1, 2, 3, 4, 5].map((d) => {
                      const active =
                        d >= task.dayStart &&
                        d < task.dayStart + task.durationDays;
                      return (
                        <td key={d} className="px-1 py-2 text-center">
                          <div
                            className={`mx-auto h-5 w-5 rounded ${
                              active
                                ? "bg-[var(--primary)]"
                                : "bg-[var(--muted)]"
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-2">
                      <button
                        onClick={() =>
                          timelineMutation.mutate({
                            action: "deleteTask",
                            taskId: task.id,
                          })
                        }
                        className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--destructive)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {week.tasks.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
              No tasks yet. Click &quot;+ Task&quot; to add one.
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        onClick={() => timelineMutation.mutate({ action: "addWeek" })}
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Add Week
      </Button>
    </div>
  );
}
