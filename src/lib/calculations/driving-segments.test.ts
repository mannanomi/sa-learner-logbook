import { describe, expect, it } from "vitest"
import { calculateDrivingSegments, formatMinutesAsHoursMinutes } from "./driving-segments"
import { SA_LEARNER_RULES } from "@/lib/rules/sa-rules"

describe("calculateDrivingSegments", () => {
  it("calculates an all-day session with no night minutes", () => {
    const result = calculateDrivingSegments("2026-06-01", "10:00", "11:30")
    expect(result.totalMinutes).toBe(90)
    expect(result.nightMinutes).toBe(0)
    expect(result.dayMinutes).toBe(90)
  })

  it("calculates an all-night session using the configured window", () => {
    // Default window: 19:00 - 06:00
    const result = calculateDrivingSegments("2026-06-01", "20:00", "22:00")
    expect(result.totalMinutes).toBe(120)
    expect(result.nightMinutes).toBe(120)
    expect(result.dayMinutes).toBe(0)
  })

  it("splits a session that crosses the day/night boundary", () => {
    // 18:30 -> 19:30: 30 day minutes, 30 night minutes
    const result = calculateDrivingSegments("2026-06-01", "18:30", "19:30")
    expect(result.totalMinutes).toBe(60)
    expect(result.dayMinutes).toBe(30)
    expect(result.nightMinutes).toBe(30)
  })

  it("handles a session crossing midnight", () => {
    // 23:00 -> 01:00 next day, entirely within the night window
    const result = calculateDrivingSegments("2026-06-01", "23:00", "01:00")
    expect(result.totalMinutes).toBe(120)
    expect(result.nightMinutes).toBe(120)
  })

  it("handles a session crossing the morning night->day boundary", () => {
    // 05:30 -> 06:30: 30 night minutes (before 06:00), 30 day minutes
    const result = calculateDrivingSegments("2026-06-01", "05:30", "06:30")
    expect(result.totalMinutes).toBe(60)
    expect(result.nightMinutes).toBe(30)
    expect(result.dayMinutes).toBe(30)
  })

  it("respects a custom rules config", () => {
    const customRules = {
      ...SA_LEARNER_RULES,
      nightWindowApproximation: {
        ...SA_LEARNER_RULES.nightWindowApproximation,
        value: { startHour: 22, endHour: 5 },
      },
    }
    const result = calculateDrivingSegments("2026-06-01", "21:00", "23:00", customRules)
    // 21:00-22:00 day, 22:00-23:00 night
    expect(result.dayMinutes).toBe(60)
    expect(result.nightMinutes).toBe(60)
  })
})

describe("formatMinutesAsHoursMinutes", () => {
  it("formats whole hours", () => {
    expect(formatMinutesAsHoursMinutes(120)).toBe("2h 0m")
  })

  it("formats hours and minutes", () => {
    expect(formatMinutesAsHoursMinutes(155)).toBe("2h 35m")
  })

  it("formats zero", () => {
    expect(formatMinutesAsHoursMinutes(0)).toBe("0h 0m")
  })
})
