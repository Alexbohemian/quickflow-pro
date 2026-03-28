import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>
      <EmptyState
        icon={<FolderKanban className="h-12 w-12" />}
        title="No projects yet"
        description="Projects are created automatically when a proposal is signed and paid. Create a proposal first."
      />
    </div>
  );
}
