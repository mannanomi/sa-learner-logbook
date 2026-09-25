import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const [profile, supervisors, drivingSessions] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("supervisors").select("*").eq("learner_id", user.id),
    supabase.from("driving_sessions").select("*").eq("learner_id", user.id),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    supervisors: supervisors.data ?? [],
    drivingSessions: drivingSessions.data ?? [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sa-learner-logbook-export-${user.id}.json"`,
    },
  })
}
