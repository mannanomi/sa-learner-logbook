"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { authSchema } from "@/lib/validation/profile"

export interface AuthActionState {
  error?: string
}

export async function signIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp(parsed.data)
  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

/** Permanently deletes the user's own account and all owned data (RLS + FK cascade). */
export async function deleteAccount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Deleting the auth user requires the service role; this app calls a
  // Supabase Edge Function / RPC with elevated privileges scoped to the
  // caller's own uid rather than holding a service-role key client-side.
  const { error } = await supabase.rpc("delete_own_account")
  if (error) {
    return { error: error.message }
  }

  await supabase.auth.signOut()
  redirect("/login")
}
