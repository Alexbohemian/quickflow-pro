"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aiIntakeSchema, type AiIntakeInput } from "@/lib/validators/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const projectTypes = [
  { value: "website", label: "Website" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "mobile-app", label: "Mobile App" },
  { value: "branding", label: "Branding" },
  { value: "marketing", label: "Marketing Campaign" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

const projectSizes = [
  { value: "SMALL", label: "Small (1-2 weeks)" },
  { value: "MEDIUM", label: "Medium (3-6 weeks)" },
  { value: "LARGE", label: "Large (7-12 weeks)" },
  { value: "ENTERPRISE", label: "Enterprise (12+ weeks)" },
];

const serviceOptions = [
  "UI/UX Design",
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "SEO",
  "Content Strategy",
  "Brand Design",
  "Project Management",
  "QA Testing",
  "DevOps",
];

export default function AIIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AiIntakeInput>({
    resolver: zodResolver(aiIntakeSchema),
    defaultValues: {
      engagementModel: "BY_TIMELINE",
      projectSize: "MEDIUM",
      services: [],
    },
  });

  async function onSubmit(data: AiIntakeInput) {
    setLoading(true);

    try {
      const res = await fetch("/api/proposals/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, services: selectedServices }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message || "Generation failed");
      }

      const proposal = await res.json();
      toast.success("AI draft generated! Review and refine.");
      router.push(`/proposals/${proposal.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/proposals")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">AI Proposal Generator</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Fill in the details and AI will generate a draft proposal for you
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            {...register("projectName")}
            label="Project Name"
            placeholder="E.g., Company X Website Redesign"
            error={errors.projectName?.message}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              {...register("projectSize")}
              label="Project Size"
              options={projectSizes}
              error={errors.projectSize?.message}
            />
            <Select
              {...register("projectType")}
              label="Type of Project"
              options={projectTypes}
              placeholder="Select type"
              error={errors.projectType?.message}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Services</label>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((service) => {
                const selected = selectedServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() =>
                      setSelectedServices((prev) =>
                        selected
                          ? prev.filter((s) => s !== service)
                          : [...prev, service]
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
            {selectedServices.length === 0 && (
              <p className="mt-1 text-xs text-[var(--destructive)]">Select at least one service</p>
            )}
          </div>

          <Input
            {...register("audience")}
            label="Target Audience"
            placeholder="E.g., Small business owners aged 25-45"
          />

          <Input
            {...register("goals")}
            label="Project Goals"
            placeholder="E.g., Increase online sales by 30%"
          />

          <Input
            {...register("features")}
            label="Key Features"
            placeholder="E.g., Product catalog, shopping cart, payment integration"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("duration")}
              label="Estimated Duration"
              placeholder="E.g., 8 weeks"
            />
            <Input
              {...register("budget")}
              label="Budget Range"
              placeholder="E.g., $10,000 - $15,000"
            />
          </div>

          <Select
            {...register("engagementModel")}
            label="Engagement Model"
            options={[
              { value: "BY_TIMELINE", label: "By Project Timeline" },
              { value: "BY_HOUR", label: "By Hour (Retainer)" },
            ]}
          />

          <Input
            {...register("paymentTerms")}
            label="Payment Terms"
            placeholder="E.g., 50% upfront, 50% on completion"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={selectedServices.length === 0}
          >
            <Sparkles className="h-4 w-4" />
            Generate Proposal Draft
          </Button>
        </form>
      </Card>
    </div>
  );
}
