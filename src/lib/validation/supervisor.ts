import { z } from "zod"

export const supervisorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  licenceNumber: z.string().trim().max(50).optional().or(z.literal("")),
  licenceState: z.string().trim().max(10).optional().or(z.literal("")),
  relationship: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
})

export type SupervisorInput = z.infer<typeof supervisorSchema>
