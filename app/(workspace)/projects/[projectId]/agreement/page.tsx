"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

export default function AgreementPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const snapshot = project?.proposal?.snapshotJson;

  return (
    <Card>
      <CardTitle className="mb-4">Signed Agreement</CardTitle>
      <CardContent>
        {snapshot ? (
          <div className="prose max-w-none">
            <p className="text-sm text-[var(--muted-foreground)]">
              This is the immutable signed agreement from the original proposal.
            </p>
            <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-[var(--muted)] p-4 text-xs">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No signed agreement available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
