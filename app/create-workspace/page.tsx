"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const slug = watch("slug");

  async function onSubmit(data: CreateWorkspaceInput) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.message || "Failed to create workspace");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Create a Workspace</h1>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Set up your agency&apos;s workspace
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <Input
            {...register("name", {
              onChange: (e) => {
                setValue("slug", slugify(e.target.value));
              },
            })}
            id="name"
            label="Workspace Name"
            placeholder="My Agency"
            error={errors.name?.message}
          />

          <div>
            <Input
              {...register("slug")}
              id="slug"
              label="Workspace URL"
              placeholder="my-agency"
              error={errors.slug?.message}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              quickflow.com/ws/{slug || "your-workspace"}
            </p>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Create Workspace
          </Button>
        </form>
      </div>
    </div>
  );
}
