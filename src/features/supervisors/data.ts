import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { SupervisorRow } from "@/types/database"

export async function listSupervisors(): Promise<SupervisorRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("supervisors").select("*").order("name")
  if (error) throw error
  return data ?? []
}
