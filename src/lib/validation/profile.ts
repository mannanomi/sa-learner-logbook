import { z } from "zod"

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required"),
  permitDate: z.string().optional().or(z.literal("")),
  targetLicenceDate: z.string().optional().or(z.literal("")),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type AuthInput = z.infer<typeof authSchema>
