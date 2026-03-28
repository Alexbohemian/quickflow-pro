"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { FolderKanban, FileText, Users, Receipt } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  stats: {
    activeProjects: number;
    openProposals: number;
    clientCount: number;
    pendingInvoices: number;
  };
  inProgressTasks: {
    id: string;
    taskCode: string;
    title: string;
    status: string;
    projectId: string;
    projectName: string;
  }[];
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const stats = data?.stats || {
    activeProjects: 0,
    openProposals: 0,
    clientCount: 0,
    pendingInvoices: 0,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/projects">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Active Projects</p>
                <CardTitle>{isLoading ? "..." : stats.activeProjects}</CardTitle>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/proposals">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Open Proposals</p>
                <CardTitle>{isLoading ? "..." : stats.openProposals}</CardTitle>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Clients</p>
                <CardTitle>{isLoading ? "..." : stats.clientCount}</CardTitle>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                <Receipt className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Pending Invoices</p>
                <CardTitle>{isLoading ? "..." : stats.pendingInvoices}</CardTitle>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">In-Progress Tasks</CardTitle>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : data?.inProgressTasks.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                No tasks in progress. Create a project to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {data?.inProgressTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.projectId}/tasks/${task.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--muted)]"
                  >
                    <span className="font-mono text-xs font-bold text-[var(--primary)]">
                      {task.taskCode}
                    </span>
                    <span className="flex-1 text-sm">{task.title}</span>
                    <Badge variant="outline">{task.projectName}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="mb-4">Quick Actions</CardTitle>
          <CardContent>
            <div className="space-y-2">
              <Link
                href="/proposals/new/intake"
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]"
              >
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium">Create AI Proposal</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Generate a proposal draft with AI</p>
                </div>
              </Link>
              <Link
                href="/clients"
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]"
              >
                <Users className="h-5 w-5 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium">Add Client</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Register a new client</p>
                </div>
              </Link>
              <Link
                href="/leads"
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]"
              >
                <FolderKanban className="h-5 w-5 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium">View Pipeline</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Manage your leads pipeline</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
