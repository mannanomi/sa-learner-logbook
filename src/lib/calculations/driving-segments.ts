import { SA_LEARNER_RULES } from "@/lib/rules/sa-rules"

export interface DrivingSegments {
  totalMinutes: number
  dayMinutes: number
  nightMinutes: number
}

/**
 * Splits a driving session into day/night minutes using the SA rules'
 * configured night-window approximation. This is the ONLY place duration and
 * day/night math should be implemented — dashboard, progress, and the Add
 * Drive form all call this rather than reimplementing it.
 *
 * `date` anchors the session's calendar day; `startTime`/`endTime` are
 * "HH:mm" (24h) local times. An end time earlier than or equal to the start
 * time is treated as crossing midnight into the next day.
 */
export function calculateDrivingSegments(
  date: string,
  startTime: string,
  endTime: string,
  rules: typeof SA_LEARNER_RULES = SA_LEARNER_RULES
): DrivingSegments {
  const start = toDateTime(date, startTime)
  let end = toDateTime(date, endTime)
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
  }

  const totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
  const { startHour, endHour } = rules.nightWindowApproximation.value

  let nightMinutes = 0
  const cursor = new Date(start)
  while (cursor.getTime() < end.getTime()) {
    const next = new Date(Math.min(cursor.getTime() + 60000, end.getTime()))
    if (isNightMinute(cursor, startHour, endHour)) {
      nightMinutes += (next.getTime() - cursor.getTime()) / 60000
    }
    cursor.setTime(next.getTime())
  }
  nightMinutes = Math.round(nightMinutes)

  return {
    totalMinutes,
    dayMinutes: totalMinutes - nightMinutes,
    nightMinutes,
  }
}

function isNightMinute(at: Date, startHour: number, endHour: number): boolean {
  const hour = at.getHours()
  if (startHour > endHour) {
    // Window wraps midnight, e.g. 19:00 - 06:00
    return hour >= startHour || hour < endHour
  }
  return hour >= startHour && hour < endHour
}

function toDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const d = new Date(`${date}T00:00:00`)
  d.setHours(hours, minutes, 0, 0)
  return d
}

export function formatMinutesAsHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
