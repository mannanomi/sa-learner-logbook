import { describe, expect, it } from "vitest"
import { SA_LEARNER_RULES } from "./sa-rules"

describe("SA_LEARNER_RULES", () => {
  it("expresses required hours in minutes, consistent with 75 total / 15 night", () => {
    expect(SA_LEARNER_RULES.requiredTotalMinutes.value).toBe(75 * 60)
    expect(SA_LEARNER_RULES.requiredNightMinutes.value).toBe(15 * 60)
    expect(SA_LEARNER_RULES.requiredNightMinutes.value).toBeLessThan(
      SA_LEARNER_RULES.requiredTotalMinutes.value
    )
  })

  it("marks verified rules as verified with a source", () => {
    expect(SA_LEARNER_RULES.requiredTotalMinutes.verified).toBe(true)
    expect(SA_LEARNER_RULES.requiredTotalMinutes.source).toBeTruthy()
  })

  it("flags unverified rules rather than presenting them as confirmed", () => {
    expect(SA_LEARNER_RULES.supervisorMinimumLicenceYears.verified).toBe(false)
    expect(SA_LEARNER_RULES.nightWindowApproximation.verified).toBe(false)
  })

  it("required session fields include supervisor sign-off", () => {
    expect(SA_LEARNER_RULES.requiredSessionFields.value).toContain("learnerConfirmation")
    expect(SA_LEARNER_RULES.requiredSessionFields.value).toContain("supervisorConfirmation")
  })
})
