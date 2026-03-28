import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
      <EmptyState
        icon={<Bell className="h-12 w-12" />}
        title="No notifications"
        description="You're all caught up. Notifications will appear here when there's activity."
      />
    </div>
  );
}
