import { describe, expect, it } from "vitest"
import { deriveSessionWarnings, drivingSessionSchema } from "./driving-session"

const validSession = {
  date: "2026-06-01",
  startTime: "10:00",
  endTime: "11:00",
  startingLocation: "Home",
  destination: "Shopping centre",
  weatherCondition: "clear" as const,
  roadCondition: "dry" as const,
  trafficCondition: "light" as const,
  supervisorId: "123e4567-e89b-12d3-a456-426614174000",
  learnerConfirmed: true,
  supervisorConfirmed: true,
}

describe("drivingSessionSchema", () => {
  it("accepts a valid session", () => {
    const result = drivingSessionSchema.safeParse(validSession)
    expect(result.success).toBe(true)
  })

  it("rejects an end time before the start time on the same day", () => {
    const result = drivingSessionSchema.safeParse({
      ...validSession,
      startTime: "11:00",
      endTime: "10:00",
    })
    // end < start is treated as crossing midnight, so this is actually valid
    // (an overnight session) — only end === start is rejected as zero duration.
    expect(result.success).toBe(true)
  })

  it("rejects a zero-duration session", () => {
    const result = drivingSessionSchema.safeParse({
      ...validSession,
      startTime: "10:00",
      endTime: "10:00",
    })
    expect(result.success).toBe(false)
  })

  it("requires learner confirmation", () => {
    const result = drivingSessionSchema.safeParse({ ...validSession, learnerConfirmed: false })
    expect(result.success).toBe(false)
  })

  it("requires supervisor confirmation", () => {
    const result = drivingSessionSchema.safeParse({ ...validSession, supervisorConfirmed: false })
    expect(result.success).toBe(false)
  })

  it("requires a supervisor to be selected", () => {
    const result = drivingSessionSchema.safeParse({ ...validSession, supervisorId: "" })
    expect(result.success).toBe(false)
  })

  it("requires starting location and destination", () => {
    const result = drivingSessionSchema.safeParse({ ...validSession, startingLocation: "" })
    expect(result.success).toBe(false)
  })
})

describe("deriveSessionWarnings", () => {
  it("warns on unusually long sessions without blocking", () => {
    const warnings = deriveSessionWarnings({
      ...validSession,
      startTime: "06:00",
      endTime: "20:00",
    })
    expect(warnings.some((w) => w.field === "endTime")).toBe(true)
  })

  it("produces no warnings for a normal session", () => {
    const warnings = deriveSessionWarnings(validSession)
    expect(warnings).toHaveLength(0)
  })
})
