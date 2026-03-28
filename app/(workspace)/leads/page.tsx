"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, type CreateLeadInput } from "@/lib/validators/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Target, GripVertical, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { LeadStage } from "@/types";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  stage: LeadStage;
  createdAt: string;
}

const STAGES: { value: LeadStage; label: string; color: string }[] = [
  { value: "PROSPECT", label: "Prospects", color: "bg-blue-500" },
  { value: "IN_DISCUSSION", label: "In Discussion", color: "bg-yellow-500" },
  { value: "FINAL_STEP", label: "Final Step", color: "bg-green-500" },
];

export default function LeadsPage() {
  const [showModal, setShowModal] = useState(false);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowModal(false);
      reset();
      toast.success("Lead added");
    },
    onError: () => toast.error("Failed to create lead"),
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: LeadStage }) => {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
  });

  function handleDragStart(leadId: string) {
    setDraggedLead(leadId);
  }

  function handleDrop(stage: LeadStage) {
    if (draggedLead) {
      updateStageMutation.mutate({ leadId: draggedLead, stage });
      setDraggedLead(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads Pipeline</h1>
        <Button onClick={() => { reset(); setShowModal(true); }}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={<Target className="h-12 w-12" />}
          title="No leads yet"
          description="Start adding leads to track your sales pipeline"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.value);
            return (
              <div
                key={stage.value}
                className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.value)}
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                  <h2 className="font-semibold">{stage.label}</h2>
                  <Badge variant="outline" className="ml-auto">
                    {stageLeads.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      className="cursor-grab rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <h3 className="font-medium">{lead.name}</h3>
                      </div>
                      {lead.company && (
                        <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Building2 className="h-3 w-3" />
                          {lead.company}
                        </p>
                      )}
                      {lead.email && (
                        <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </p>
                      )}
                      {lead.phone && (
                        <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Lead"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input
            {...register("name")}
            id="lead-name"
            label="Name"
            placeholder="John Smith"
            error={errors.name?.message}
          />
          <Input
            {...register("company")}
            id="lead-company"
            label="Company"
            placeholder="Company name"
          />
          <Input
            {...register("email")}
            id="lead-email"
            label="Email"
            type="email"
            placeholder="john@company.com"
            error={errors.email?.message}
          />
          <Input
            {...register("phone")}
            id="lead-phone"
            label="Phone"
            placeholder="+1 (555) 000-0000"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Add Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
