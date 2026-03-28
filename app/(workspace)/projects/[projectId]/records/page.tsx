import { EmptyState } from "@/components/ui/empty-state";
import { Clock } from "lucide-react";

export default function RecordsPage() {
  return (
    <EmptyState
      icon={<Clock className="h-12 w-12" />}
      title="No time records yet"
      description="Time records will appear here as hours are logged against maintenance requests."
    />
  );
}
