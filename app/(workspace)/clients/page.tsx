"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema, type CreateClientInput } from "@/lib/validators/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Users, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  _count: { projects: number; proposals: number };
}

export default function ClientsPage() {
  const [tab, setTab] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Client[] }>({
    queryKey: ["clients", tab],
    queryFn: async () => {
      const res = await fetch(`/api/clients?active=${tab === "active"}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create client");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowModal(false);
      toast.success("Client created");
    },
    onError: () => toast.error("Failed to create client"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
  });

  function onSubmit(data: CreateClientInput) {
    createMutation.mutate(data);
  }

  const clients = data?.data || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button
          onClick={() => {
            reset();
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      <Tabs
        tabs={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6 w-fit"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No clients yet"
          description="Add your first client to start creating proposals"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <Avatar name={client.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{client.name}</h3>
                  {client.company && (
                    <p className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company}
                    </p>
                  )}
                  {client.email && (
                    <p className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <Mail className="h-3.5 w-3.5" />
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <Phone className="h-3.5 w-3.5" />
                      {client.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="outline">
                  {client._count.projects} project{client._count.projects !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline">
                  {client._count.proposals} proposal{client._count.proposals !== 1 ? "s" : ""}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Client"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("name")}
            id="client-name"
            label="Client Name"
            placeholder="Acme Corp"
            error={errors.name?.message}
          />
          <Input
            {...register("company")}
            id="client-company"
            label="Company"
            placeholder="Company name"
          />
          <Input
            {...register("email")}
            id="client-email"
            label="Email"
            type="email"
            placeholder="contact@company.com"
            error={errors.email?.message}
          />
          <Input
            {...register("phone")}
            id="client-phone"
            label="Phone"
            placeholder="+1 (555) 000-0000"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
