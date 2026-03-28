import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen } from "lucide-react";

export default function ProjectFilesPage() {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title="No files yet"
      description="Upload files to share with the team and client. File storage integration with Cloudflare R2 coming in Phase 2."
    />
  );
}
