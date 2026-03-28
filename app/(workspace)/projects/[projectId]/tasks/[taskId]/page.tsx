"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Send, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  isBot: boolean;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface TaskDetail {
  id: string;
  taskCode: string;
  title: string;
  description: string | null;
  status: string;
  assignedTo: string | null;
  durationDays: number;
  completedAt: string | null;
  comments: Comment[];
  dependsOn: { taskCode: string; title: string } | null;
  dependents: { taskCode: string; title: string }[];
  week: { project: { id: string; name: string } };
}

export default function TaskDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const taskId = params.taskId as string;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const { data: task, isLoading } = useQuery<TaskDetail>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const sendComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      setMessage("");
    },
    onError: () => toast.error("Failed to send"),
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Status updated");
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!task) return null;

  return (
    <div className="flex h-[calc(100vh-16rem)] gap-6">
      {/* Left panel — Task details */}
      <div className="w-96 shrink-0 overflow-y-auto rounded-lg border border-[var(--border)] p-6">
        <Link
          href={`/projects/${projectId}/timeline`}
          className="mb-4 flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to timeline
        </Link>

        <div className="mb-4 flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-[var(--primary)]">
            {task.taskCode}
          </span>
          <Badge
            variant={
              task.status === "COMPLETED"
                ? "success"
                : task.status === "EXPIRED"
                  ? "destructive"
                  : task.status === "IN_PROGRESS"
                    ? "primary"
                    : "default"
            }
          >
            {task.status.replace("_", " ")}
          </Badge>
        </div>

        <h2 className="mb-4 text-xl font-bold">{task.title}</h2>

        {task.description && (
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            {task.description}
          </p>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Assigned to</span>
            <span className="font-medium">{task.assignedTo || "Unassigned"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Duration</span>
            <span className="font-medium">{task.durationDays} day{task.durationDays !== 1 ? "s" : ""}</span>
          </div>
          {task.dependsOn && (
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Depends on</span>
              <span className="font-medium">
                {task.dependsOn.taskCode}: {task.dependsOn.title}
              </span>
            </div>
          )}
          {task.completedAt && (
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Completed</span>
              <span className="font-medium">{formatDate(task.completedAt)}</span>
            </div>
          )}
        </div>

        {task.status !== "COMPLETED" && (
          <div className="mt-6 flex gap-2">
            {task.status === "NOT_STARTED" && (
              <Button
                className="flex-1"
                onClick={() => updateStatus.mutate("IN_PROGRESS")}
              >
                Start Task
              </Button>
            )}
            {task.status === "IN_PROGRESS" && (
              <Button
                className="flex-1"
                onClick={() => updateStatus.mutate("COMPLETED")}
              >
                Mark Complete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right panel — Chat */}
      <div className="flex flex-1 flex-col rounded-lg border border-[var(--border)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="font-semibold">Task Chat</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {task.comments.length} message{task.comments.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {task.comments.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No messages yet. Start the conversation.
            </p>
          )}
          {task.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                src={comment.user.image}
                name={comment.user.name || "User"}
                size="sm"
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {comment.isBot ? "QuickflowAI" : comment.user.name}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  {typeof comment.content === "string"
                    ? comment.content
                    : JSON.stringify(comment.content)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim()) {
                  sendComment.mutate(message.trim());
                }
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <Button
              size="icon"
              onClick={() => {
                if (message.trim()) sendComment.mutate(message.trim());
              }}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
