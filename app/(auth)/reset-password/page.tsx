"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (!token) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error?.message || "Reset failed");
      setLoading(false);
      return;
    }

    router.push("/login?reset=success");
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Invalid link</h1>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="text-sm text-[var(--primary)] hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Set new password</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}
        <Input
          {...register("password")}
          id="password"
          label="New Password"
          type="password"
          error={errors.password?.message}
        />
        <Input
          {...register("confirmPassword")}
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Reset Password
        </Button>
      </form>
    </>
  );
}
