"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "PM", label: "PM / Account Manager" },
  { value: "FINANCE", label: "Finance" },
  { value: "TEAM_MEMBER", label: "Team Member" },
];

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (input: InviteMemberInput) => {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message || "Failed to invite");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setShowInvite(false);
      reset();
      toast.success("Invitation sent");
    },
    onError: (e) => toast.error(e.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { role: "TEAM_MEMBER" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team</h1>
        <Button onClick={() => { reset(); setShowInvite(true); }}>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={m.user.image} name={m.user.name || m.user.email} size="sm" />
                    <span className="font-medium">{m.user.name || "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[var(--muted-foreground)]">
                  {m.user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{m.role.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-[var(--muted-foreground)]">
                  {new Date(m.joinedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <form onSubmit={handleSubmit((d) => inviteMutation.mutate(d))} className="space-y-4">
          <Input
            {...register("email")}
            id="invite-email"
            label="Email"
            type="email"
            placeholder="teammate@company.com"
            error={errors.email?.message}
          />
          <Select
            {...register("role")}
            id="invite-role"
            label="Role"
            options={roleOptions}
            error={errors.role?.message}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviteMutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
