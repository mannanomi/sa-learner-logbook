"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { drivingSessionSchema } from "@/lib/validation/driving-session"
import { calculateDrivingSegments } from "@/lib/calculations/driving-segments"

export interface SessionActionState {
  error?: string
  fieldErrors?: Record<string, string>
}

function parseFormData(formData: FormData) {
  return {
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
    startingLocation: String(formData.get("startingLocation") ?? ""),
    destination: String(formData.get("destination") ?? ""),
    weatherCondition: String(formData.get("weatherCondition") ?? ""),
    roadCondition: String(formData.get("roadCondition") ?? ""),
    trafficCondition: String(formData.get("trafficCondition") ?? ""),
    supervisorId: String(formData.get("supervisorId") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    learnerConfirmed: formData.get("learnerConfirmed") === "on",
    supervisorConfirmed: formData.get("supervisorConfirmed") === "on",
  }
}

export async function createDrivingSession(
  _prevState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = drivingSessionSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message
    }
    return { error: "Please fix the highlighted fields", fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const segments = calculateDrivingSegments(parsed.data.date, parsed.data.startTime, parsed.data.endTime)

  const { error } = await supabase.from("driving_sessions").insert({
    learner_id: user.id,
    supervisor_id: parsed.data.supervisorId,
    session_date: parsed.data.date,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    total_minutes: segments.totalMinutes,
    day_minutes: segments.dayMinutes,
    night_minutes: segments.nightMinutes,
    starting_location: parsed.data.startingLocation,
    destination: parsed.data.destination,
    weather_condition: parsed.data.weatherCondition,
    road_condition: parsed.data.roadCondition,
    traffic_condition: parsed.data.trafficCondition,
    notes: parsed.data.notes || null,
    learner_confirmed: parsed.data.learnerConfirmed,
    supervisor_confirmed: parsed.data.supervisorConfirmed,
    sync_status: "synced",
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/history")
  revalidatePath("/progress")
  redirect("/dashboard")
}

export async function updateDrivingSession(
  id: string,
  _prevState: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const parsed = drivingSessionSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message
    }
    return { error: "Please fix the highlighted fields", fieldErrors }
  }

  const supabase = await createClient()
  const segments = calculateDrivingSegments(parsed.data.date, parsed.data.startTime, parsed.data.endTime)

  const { error } = await supabase
    .from("driving_sessions")
    .update({
      supervisor_id: parsed.data.supervisorId,
      session_date: parsed.data.date,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      total_minutes: segments.totalMinutes,
      day_minutes: segments.dayMinutes,
      night_minutes: segments.nightMinutes,
      starting_location: parsed.data.startingLocation,
      destination: parsed.data.destination,
      weather_condition: parsed.data.weatherCondition,
      road_condition: parsed.data.roadCondition,
      traffic_condition: parsed.data.trafficCondition,
      notes: parsed.data.notes || null,
      learner_confirmed: parsed.data.learnerConfirmed,
      supervisor_confirmed: parsed.data.supervisorConfirmed,
    })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/history")
  revalidatePath("/progress")
  redirect("/history")
}

export async function deleteDrivingSession(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("driving_sessions").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/dashboard")
  revalidatePath("/history")
  revalidatePath("/progress")
}
