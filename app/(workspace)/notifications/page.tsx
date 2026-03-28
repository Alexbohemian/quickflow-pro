"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  FileText,
  Receipt,
  MessageSquare,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  TASK_DUE: AlertTriangle,
  TASK_EXPIRED: AlertTriangle,
  TASK_COMPLETED: CheckCheck,
  PROPOSAL_SENT: FileText,
  PROPOSAL_SIGNED: FileText,
  INVOICE_CREATED: Receipt,
  CHANGE_ORDER_PENDING: FileText,
  CHANGE_ORDER_APPROVED: CheckCheck,
  MENTION: MessageSquare,
  AGENT_ALERT: Bot,
};

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    data: Notification[];
    unreadCount: number;
  }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const markRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <Badge variant="primary">{unreadCount} unread</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-12 w-12" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.id);
                  if (n.link) router.push(n.link);
                }}
                className={cn(
                  "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
                  n.isRead
                    ? "border-[var(--border)] bg-[var(--background)]"
                    : "border-[var(--primary)]/20 bg-[var(--primary)]/5"
                )}
              >
                <div className={cn(
                  "mt-0.5 rounded-lg p-2",
                  n.type.includes("EXPIRED") || n.type.includes("DUE")
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{n.body}</p>}
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
