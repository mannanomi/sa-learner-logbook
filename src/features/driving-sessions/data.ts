import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { DrivingSessionRow } from "@/types/database"

export interface SessionFilters {
  fromDate?: string
  toDate?: string
  supervisorId?: string
  dayNight?: "day" | "night"
  weatherCondition?: string
  roadCondition?: string
  trafficCondition?: string
}

export async function listDrivingSessions(filters: SessionFilters = {}): Promise<DrivingSessionRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from("driving_sessions")
    .select("*")
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false })

  if (filters.fromDate) query = query.gte("session_date", filters.fromDate)
  if (filters.toDate) query = query.lte("session_date", filters.toDate)
  if (filters.supervisorId) query = query.eq("supervisor_id", filters.supervisorId)
  if (filters.dayNight === "day") query = query.gt("day_minutes", 0)
  if (filters.dayNight === "night") query = query.gt("night_minutes", 0)
  if (filters.weatherCondition) query = query.eq("weather_condition", filters.weatherCondition)
  if (filters.roadCondition) query = query.eq("road_condition", filters.roadCondition)
  if (filters.trafficCondition) query = query.eq("traffic_condition", filters.trafficCondition)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getDrivingSession(id: string): Promise<DrivingSessionRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("driving_sessions").select("*").eq("id", id).single()
  if (error) return null
  return data
}

export async function getRecentSessions(limit = 5): Promise<DrivingSessionRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("driving_sessions")
    .select("*")
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getAllSessionMinutes(): Promise<
  { session_date: string; day_minutes: number; night_minutes: number }[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("driving_sessions")
    .select("session_date, day_minutes, night_minutes")
  if (error) throw error
  return data ?? []
}
