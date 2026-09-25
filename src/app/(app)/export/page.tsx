import { listDrivingSessions } from "@/features/driving-sessions/data"
import { listSupervisors } from "@/features/supervisors/data"
import { createClient } from "@/lib/supabase/server"
import { LogbookExportView } from "@/features/export/logbook-export-view"

export default async function ExportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  const [sessions, supervisors] = await Promise.all([listDrivingSessions(), listSupervisors()])
  const supervisorsById = Object.fromEntries(supervisors.map((s) => [s.id, s]))

  return <LogbookExportView sessions={sessions} supervisorsById={supervisorsById} profile={profile} />
}
