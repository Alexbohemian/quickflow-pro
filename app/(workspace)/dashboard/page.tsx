import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { FolderKanban, FileText, Users, Receipt } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Active Projects
              </p>
              <CardTitle>0</CardTitle>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Open Proposals
              </p>
              <CardTitle>0</CardTitle>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Clients</p>
              <CardTitle>0</CardTitle>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
              <Receipt className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Pending Invoices
              </p>
              <CardTitle>0</CardTitle>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">In-Progress Tasks</CardTitle>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              No tasks in progress. Create a project to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="mb-4">Recent Activity</CardTitle>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              No recent activity yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
