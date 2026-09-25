import { z } from "zod"
import { SA_LEARNER_RULES } from "@/lib/rules/sa-rules"
import { calculateDrivingSegments } from "@/lib/calculations/driving-segments"

export const WEATHER_CONDITIONS = ["clear", "rain", "fog", "overcast", "storm"] as const
export const ROAD_CONDITIONS = ["dry", "wet", "gravel", "icy", "under-construction"] as const
export const TRAFFIC_CONDITIONS = ["light", "moderate", "heavy"] as const

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * A "warning" is informational and never blocks submission; only Zod issues
 * block. Callers should surface `deriveWarnings()` output separately from
 * form errors.
 */
export const drivingSessionSchema = z
  .object({
    date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date"),
    startTime: z.string().regex(timeRegex, "Enter a valid start time"),
    endTime: z.string().regex(timeRegex, "Enter a valid end time"),
    startingLocation: z.string().trim().min(1, "Starting location is required"),
    destination: z.string().trim().min(1, "Destination is required"),
    weatherCondition: z.enum(WEATHER_CONDITIONS),
    roadCondition: z.enum(ROAD_CONDITIONS),
    trafficCondition: z.enum(TRAFFIC_CONDITIONS),
    supervisorId: z.string().uuid("Select a supervisor"),
    notes: z.string().trim().max(2000).optional(),
    learnerConfirmed: z.boolean().refine((v) => v === true, {
      message: "You must confirm this session before saving it",
    }),
    supervisorConfirmed: z.boolean().refine((v) => v === true, {
      message: "The supervising driver must confirm this session",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.startTime === data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be different from start time",
      })
    }
  })

export type DrivingSessionInput = z.infer<typeof drivingSessionSchema>

export interface SessionWarning {
  field: keyof DrivingSessionInput | "general"
  message: string
}

/**
 * Non-blocking, helpful nudges — never returned as Zod errors so the user is
 * never prevented from saving a real (if unusual) session.
 */
export function deriveSessionWarnings(data: DrivingSessionInput): SessionWarning[] {
  const warnings: SessionWarning[] = []
  const segments = calculateDrivingSegments(data.date, data.startTime, data.endTime)

  if (segments.totalMinutes > SA_LEARNER_RULES.maxReasonableSessionMinutes.value) {
    warnings.push({
      field: "endTime",
      message: `This session is over ${Math.round(
        SA_LEARNER_RULES.maxReasonableSessionMinutes.value / 60
      )} hours long — double check the start and end times.`,
    })
  }

  if (new Date(data.date).getTime() > Date.now()) {
    warnings.push({ field: "date", message: "This session is dated in the future." })
  }

  return warnings
}
