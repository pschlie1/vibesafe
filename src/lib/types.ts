import { z } from "zod";

export const createAppSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  ownerEmail: z.string().email(),
  ownerName: z.string().optional(),
  criticality: z.enum(["low", "medium", "high"]).default("medium"),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;

export type SecurityFinding = {
  code: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  fixPrompt: string;
};
