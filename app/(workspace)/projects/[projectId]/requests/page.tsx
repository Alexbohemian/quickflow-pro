"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface Request {
  id: string;
  title: string;
  assignedTo: string | null;
  priority: string;
  status: string;
  totalHours: number;
  createdAt: string;
}

const priorityVariant: Record<string, "default" | "destructive" | "warning"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "destructive",
};

export default function RequestsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ["requests", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/requests`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests", projectId] });
      setShowCreate(false);
      setTitle("");
      toast.success("Request created");
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="No requests yet"
          description="Create maintenance requests for this by-hours project."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.title}</TableCell>
                <TableCell>{req.assignedTo || "—"}</TableCell>
                <TableCell>
                  <Badge variant={priorityVariant[req.priority] || "default"}>
                    {req.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={req.status === "COMPLETED" ? "success" : "default"}>
                    {req.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{req.totalHours}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Request">
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            label="Title"
            placeholder="Fix login page bug"
          />
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            label="Priority"
            options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High (20% surcharge)" },
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createRequest.mutate()} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
