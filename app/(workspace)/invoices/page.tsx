import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Invoices</h1>
      <EmptyState
        icon={<Receipt className="h-12 w-12" />}
        title="No invoices yet"
        description="Invoices will appear here once projects are active."
      />
    </div>
  );
}
