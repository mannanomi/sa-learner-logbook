import { describe, expect, it } from "vitest"
import {
  calculateDrivingAverages,
  calculateProgress,
  estimateCompletionDate,
  type SessionMinutesSummary,
} from "./progress"

const requiredTotal = 75 * 60
const requiredNight = 15 * 60

describe("calculateProgress", () => {
  it("returns zeroed progress with no sessions", () => {
    const result = calculateProgress([])
    expect(result.totalMinutes).toBe(0)
    expect(result.percentComplete).toBe(0)
    expect(result.remainingTotalMinutes).toBe(requiredTotal)
    expect(result.remainingNightMinutes).toBe(requiredNight)
  })

  it("sums day and night minutes across sessions", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: 60, nightMinutes: 30 },
      { date: "2026-01-02", dayMinutes: 90, nightMinutes: 0 },
    ]
    const result = calculateProgress(sessions)
    expect(result.dayMinutes).toBe(150)
    expect(result.nightMinutes).toBe(30)
    expect(result.totalMinutes).toBe(180)
  })

  it("clamps percent complete at 100 when hours exceed the requirement", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: requiredTotal + 500, nightMinutes: requiredNight + 100 },
    ]
    const result = calculateProgress(sessions)
    expect(result.percentComplete).toBe(100)
    expect(result.nightPercentComplete).toBe(100)
    expect(result.remainingTotalMinutes).toBe(0)
    expect(result.remainingNightMinutes).toBe(0)
  })

  it("computes remaining hours correctly", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: 2000, nightMinutes: 500 },
    ]
    const result = calculateProgress(sessions)
    expect(result.remainingTotalMinutes).toBe(requiredTotal - 2500)
    expect(result.remainingNightMinutes).toBe(requiredNight - 500)
  })
})

describe("calculateDrivingAverages", () => {
  it("returns zero averages with no sessions", () => {
    expect(calculateDrivingAverages([])).toEqual({
      weeklyAverageMinutes: 0,
      monthlyAverageMinutes: 0,
    })
  })

  it("averages minutes over the span of recorded sessions", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: 60, nightMinutes: 0 },
      { date: "2026-01-08", dayMinutes: 60, nightMinutes: 0 },
    ]
    // span = 8 days, total 120 minutes -> ~105 min/week
    const result = calculateDrivingAverages(sessions)
    expect(result.weeklyAverageMinutes).toBeCloseTo(105, -1)
  })
})

describe("estimateCompletionDate", () => {
  it("refuses to estimate with too few sessions", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: 60, nightMinutes: 0 },
    ]
    const result = estimateCompletionDate(sessions)
    expect(result.estimatedDate).toBeNull()
    expect(result.reason).toBeDefined()
  })

  it("refuses to estimate when history spans less than a week", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: 60, nightMinutes: 0 },
      { date: "2026-01-01", dayMinutes: 60, nightMinutes: 0 },
      { date: "2026-01-02", dayMinutes: 60, nightMinutes: 0 },
    ]
    const result = estimateCompletionDate(sessions)
    expect(result.estimatedDate).toBeNull()
  })

  it("produces an estimate with sufficient consistent history", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: 120, nightMinutes: 0 },
      { date: "2026-01-08", dayMinutes: 120, nightMinutes: 0 },
      { date: "2026-01-15", dayMinutes: 120, nightMinutes: 0 },
      { date: "2026-01-22", dayMinutes: 120, nightMinutes: 0 },
    ]
    const result = estimateCompletionDate(sessions)
    expect(result.estimatedDate).not.toBeNull()
  })

  it("reports already complete when required hours are met", () => {
    const sessions: SessionMinutesSummary[] = [
      { date: "2026-01-01", dayMinutes: requiredTotal, nightMinutes: requiredNight },
      { date: "2026-01-08", dayMinutes: 60, nightMinutes: 0 },
      { date: "2026-01-15", dayMinutes: 60, nightMinutes: 0 },
    ]
    const result = estimateCompletionDate(sessions)
    expect(result.estimatedDate).toBeNull()
    expect(result.reason).toMatch(/already complete/i)
  })
})
