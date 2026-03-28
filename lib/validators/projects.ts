import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const createLeadSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateLeadStageSchema = z.object({
  stage: z.enum(["PROSPECT", "IN_DISCUSSION", "FINAL_STEP", "ARCHIVED"]),
  position: z.number().int().min(0).optional(),
});

export const createInvoiceSchema = z.object({
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number(),
        taxRate: z.number().min(0).max(100).default(0),
      })
    )
    .min(1, "At least one line item is required"),
});

export const changeOrderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  weekTarget: z.number().int().positive().optional(),
  pricing: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number(),
        taxRate: z.number().min(0).max(100).default(0),
      })
    )
    .optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
