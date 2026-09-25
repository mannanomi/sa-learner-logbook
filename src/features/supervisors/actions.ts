"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { supervisorSchema } from "@/lib/validation/supervisor"

export interface SupervisorActionState {
  error?: string
}

function parseFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    licenceNumber: String(formData.get("licenceNumber") ?? ""),
    licenceState: String(formData.get("licenceState") ?? ""),
    relationship: String(formData.get("relationship") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  }
}

export async function createSupervisor(
  _prevState: SupervisorActionState,
  formData: FormData
): Promise<SupervisorActionState> {
  const parsed = supervisorSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in" }

  const { error } = await supabase.from("supervisors").insert({
    learner_id: user.id,
    name: parsed.data.name,
    licence_number: parsed.data.licenceNumber || null,
    licence_state: parsed.data.licenceState || null,
    relationship: parsed.data.relationship || null,
    notes: parsed.data.notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/supervisors")
  return {}
}

export async function updateSupervisor(
  id: string,
  _prevState: SupervisorActionState,
  formData: FormData
): Promise<SupervisorActionState> {
  const parsed = supervisorSchema.safeParse(parseFormData(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("supervisors")
    .update({
      name: parsed.data.name,
      licence_number: parsed.data.licenceNumber || null,
      licence_state: parsed.data.licenceState || null,
      relationship: parsed.data.relationship || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/supervisors")
  return {}
}

export async function deleteSupervisor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("supervisors").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/supervisors")
}
