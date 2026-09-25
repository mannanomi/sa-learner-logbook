/**
 * Central South Australian learner driver logbook rules configuration.
 *
 * This is the SINGLE SOURCE OF TRUTH for all SA licensing/logbook numbers used
 * across the app (validation, calculations, dashboard, progress, export).
 * Nothing outside this file should hard-code a required-hours figure, a night
 * definition, or a required-field list — update it here and every consumer
 * follows.
 *
 * Verified against official South Australian sources (mylicence.sa.gov.au) on
 * 2026-09-05. Where a figure could not be verified against an official page in
 * this pass, it is marked `verified: false` and the app must not present it as
 * a confirmed legal requirement.
 *
 * Sources:
 * - https://mylicence.sa.gov.au/the-driving-companion/logbook
 * - https://mylicence.sa.gov.au/the-driving-companion/declaration
 * - https://mylicence.sa.gov.au/safe-driving-tips/driving-at-night
 */

export type NightDefinitionMode = "sunset-to-sunrise" | "fixed-window"

export interface SaRuleValue<T> {
  value: T
  verified: boolean
  source?: string
  note?: string
}

export const SA_LEARNER_RULES = {
  state: "SA" as const,
  effectiveFrom: "2026-09-05",

  requiredTotalMinutes: {
    value: 75 * 60,
    verified: true,
    source: "https://mylicence.sa.gov.au/the-driving-companion/declaration",
    note: "75 hours (4,500 minutes) total supervised driving experience.",
  } satisfies SaRuleValue<number>,

  requiredNightMinutes: {
    value: 15 * 60,
    verified: true,
    source: "https://mylicence.sa.gov.au/the-driving-companion/logbook",
    note: "15 of the 75 required hours must be night driving.",
  } satisfies SaRuleValue<number>,

  minimumLearnerPeriodMonths: {
    value: 12,
    verified: true,
    source: "https://mylicence.sa.gov.au/my-car-licence/learners-stage",
    note: "Minimum time on a learner's permit before applying for a provisional licence.",
  } satisfies SaRuleValue<number>,

  /**
   * Official definition is sunset-to-sunrise, which varies by date and
   * location and is NOT a fixed clock window. Computing true sunset/sunrise
   * requires geolocation + a solar calculation (or an API) that this MVP does
   * not yet perform. Until that's wired up, the app uses a configurable fixed
   * approximation and must visibly label night hours computed this way as an
   * approximation, not an official record.
   */
  nightDefinition: {
    value: "sunset-to-sunrise" as NightDefinitionMode,
    verified: true,
    source: "https://mylicence.sa.gov.au/safe-driving-tips/driving-at-night",
    note: "Official definition. App currently approximates with a fixed window (see nightWindowApproximation) pending a sunrise/sunset calculation service.",
  } satisfies SaRuleValue<NightDefinitionMode>,

  /**
   * Fixed-window approximation of "night" used only until a real sunset/
   * sunrise lookup is implemented. Adelaide's sunset ranges from ~5:10pm
   * (mid-winter) to ~8:30pm (mid-summer), so a fixed window will always be
   * imprecise near dawn/dusk. Sessions crossing this boundary are split
   * proportionally by calculateDrivingSegments(), and the UI must disclose
   * that this is an approximation.
   */
  nightWindowApproximation: {
    value: { startHour: 19, endHour: 6 },
    verified: false,
    note: "NEEDS VERIFICATION / replacement: fixed 7pm-6am approximation, not the official sunset-to-sunrise definition. Swap for a real solar calculation before relying on this for official submission.",
  } satisfies SaRuleValue<{ startHour: number; endHour: number }>,

  /**
   * Minimum full-licence duration required to be a qualified supervising
   * driver. Commonly cited as 4+ years unrestricted, but not confirmed here
   * against an official page — flagged for verification rather than enforced.
   */
  supervisorMinimumLicenceYears: {
    value: 4,
    verified: false,
    note: "NEEDS VERIFICATION against an official SA source before this is enforced as a hard validation rule.",
  } satisfies SaRuleValue<number>,

  requiredSessionFields: {
    value: [
      "date",
      "startTime",
      "endTime",
      "startingLocation",
      "destination",
      "weatherCondition",
      "roadCondition",
      "trafficCondition",
      "supervisorId",
      "learnerConfirmation",
      "supervisorConfirmation",
    ] as const,
    verified: true,
    source: "https://mylicence.sa.gov.au/the-driving-companion/logbook",
    note: "Fields the official paper logbook captures per session; supervisor sign-off is required for a session to be valid.",
  } satisfies SaRuleValue<readonly string[]>,

  maxReasonableSessionMinutes: {
    value: 12 * 60,
    verified: false,
    note: "Not an official rule — an app-side sanity check to prompt a review of unusually long single sessions, not a hard block.",
  },
} as const

export type SaLearnerRules = typeof SA_LEARNER_RULES

/** Convenience accessors so call sites read `.minutes` without unwrapping `.value` everywhere. */
export const saRuleMinutes = {
  requiredTotal: SA_LEARNER_RULES.requiredTotalMinutes.value,
  requiredNight: SA_LEARNER_RULES.requiredNightMinutes.value,
  maxReasonableSession: SA_LEARNER_RULES.maxReasonableSessionMinutes.value,
}
