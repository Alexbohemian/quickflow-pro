import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Analytics</h1>
      <EmptyState
        icon={<BarChart3 className="h-12 w-12" />}
        title="No analytics data yet"
        description="Analytics will populate once projects are active and tasks start tracking."
      />
    </div>
  );
}
