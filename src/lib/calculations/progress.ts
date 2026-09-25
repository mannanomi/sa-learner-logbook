import { SA_LEARNER_RULES } from "@/lib/rules/sa-rules"

export interface SessionMinutesSummary {
  dayMinutes: number
  nightMinutes: number
  date: string // ISO yyyy-mm-dd, used for weekly/monthly averages and completion estimate
}

export interface ProgressSummary {
  totalMinutes: number
  dayMinutes: number
  nightMinutes: number
  requiredTotalMinutes: number
  requiredNightMinutes: number
  remainingTotalMinutes: number
  remainingNightMinutes: number
  percentComplete: number
  nightPercentComplete: number
}

export function calculateProgress(
  sessions: SessionMinutesSummary[],
  rules: typeof SA_LEARNER_RULES = SA_LEARNER_RULES
): ProgressSummary {
  const dayMinutes = sessions.reduce((sum, s) => sum + s.dayMinutes, 0)
  const nightMinutes = sessions.reduce((sum, s) => sum + s.nightMinutes, 0)
  const totalMinutes = dayMinutes + nightMinutes

  const requiredTotalMinutes = rules.requiredTotalMinutes.value
  const requiredNightMinutes = rules.requiredNightMinutes.value

  return {
    totalMinutes,
    dayMinutes,
    nightMinutes,
    requiredTotalMinutes,
    requiredNightMinutes,
    remainingTotalMinutes: Math.max(0, requiredTotalMinutes - totalMinutes),
    remainingNightMinutes: Math.max(0, requiredNightMinutes - nightMinutes),
    percentComplete: clampPercent((totalMinutes / requiredTotalMinutes) * 100),
    nightPercentComplete: clampPercent((nightMinutes / requiredNightMinutes) * 100),
  }
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export interface DrivingAverages {
  weeklyAverageMinutes: number
  monthlyAverageMinutes: number
}

/**
 * Averages are based on the span between the earliest and latest session in
 * the data, not calendar time since permit issue — a learner who drove twice
 * last month shouldn't see an average diluted by months of no driving before
 * their first ever session.
 */
export function calculateDrivingAverages(
  sessions: SessionMinutesSummary[]
): DrivingAverages {
  if (sessions.length === 0) {
    return { weeklyAverageMinutes: 0, monthlyAverageMinutes: 0 }
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.dayMinutes + s.nightMinutes, 0)
  const dates = sessions.map((s) => new Date(s.date).getTime())
  const spanMs = Math.max(...dates) - Math.min(...dates)
  const spanDays = Math.max(1, spanMs / (24 * 60 * 60 * 1000) + 1)

  return {
    weeklyAverageMinutes: Math.round((totalMinutes / spanDays) * 7),
    monthlyAverageMinutes: Math.round((totalMinutes / spanDays) * 30),
  }
}

export interface CompletionEstimate {
  /** null when there isn't enough history to make a responsible estimate. */
  estimatedDate: string | null
  reason?: string
}

const MIN_SESSIONS_FOR_ESTIMATE = 3
const MIN_SPAN_DAYS_FOR_ESTIMATE = 7

/**
 * Deliberately refuses to guess when history is thin — a single weekend of
 * driving is not a reliable predictor of pace, and a misleading completion
 * date is worse than none.
 */
export function estimateCompletionDate(
  sessions: SessionMinutesSummary[],
  rules: typeof SA_LEARNER_RULES = SA_LEARNER_RULES
): CompletionEstimate {
  if (sessions.length < MIN_SESSIONS_FOR_ESTIMATE) {
    return {
      estimatedDate: null,
      reason: `Need at least ${MIN_SESSIONS_FOR_ESTIMATE} recorded sessions to estimate a completion date.`,
    }
  }

  const dates = sessions.map((s) => new Date(s.date).getTime())
  const spanDays = (Math.max(...dates) - Math.min(...dates)) / (24 * 60 * 60 * 1000) + 1
  if (spanDays < MIN_SPAN_DAYS_FOR_ESTIMATE) {
    return {
      estimatedDate: null,
      reason: "Need at least a week of driving history to estimate a reliable pace.",
    }
  }

  const progress = calculateProgress(sessions, rules)
  if (progress.remainingTotalMinutes === 0) {
    return { estimatedDate: null, reason: "Required hours already complete." }
  }

  const { monthlyAverageMinutes } = calculateDrivingAverages(sessions)
  if (monthlyAverageMinutes <= 0) {
    return { estimatedDate: null, reason: "No recent driving pace to project from." }
  }

  const monthsRemaining = progress.remainingTotalMinutes / monthlyAverageMinutes
  const estimated = new Date()
  estimated.setDate(estimated.getDate() + Math.ceil(monthsRemaining * 30))

  return { estimatedDate: estimated.toISOString().slice(0, 10) }
}
