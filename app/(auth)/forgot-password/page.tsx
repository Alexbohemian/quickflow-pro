"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          If an account exists with that email, we&apos;ve sent a password reset
          link.
        </p>
        <Link href="/login" className="text-sm text-[var(--primary)] hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("email")}
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Back to login
        </Link>
      </p>
    </>
  );
}
