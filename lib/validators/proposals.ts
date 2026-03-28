import { z } from "zod";

export const createProposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["BY_TIMELINE", "BY_HOUR"]),
  clientId: z.string().optional(),
  byHourSub: z.enum(["OPEN_HOURS", "LIMITED_HOURS"]).optional(),
  hourlyRate: z.number().positive().optional(),
  monthlyHours: z.number().int().positive().optional(),
});

export const proposalSectionSchema = z.object({
  title: z.string().min(1),
  type: z.enum([
    "RICH_TEXT",
    "TIMELINE",
    "PRICING",
    "PENALTY",
    "SIGNATURE",
    "BY_HOURS_CONFIG",
  ]),
  content: z.any().optional(),
  position: z.number().int().min(0),
});

export const pricingItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number(),
  taxRate: z.number().min(0).max(100).default(0),
});

export const aiIntakeSchema = z.object({
  projectName: z.string().min(1),
  clientId: z.string().optional(),
  projectSize: z.enum(["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]),
  projectType: z.string().min(1),
  services: z.array(z.string()).min(1),
  audience: z.string().optional(),
  goals: z.string().optional(),
  features: z.string().optional(),
  duration: z.string().optional(),
  budget: z.string().optional(),
  paymentTerms: z.string().optional(),
  engagementModel: z.enum(["BY_TIMELINE", "BY_HOUR"]),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type AiIntakeInput = z.infer<typeof aiIntakeSchema>;
