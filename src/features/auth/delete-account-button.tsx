"use client"

import { useTransition } from "react"
import { deleteAccount } from "./actions"
import { Button } from "@/components/ui/button"

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (
          confirm(
            "This will permanently delete your account and every driving session you've recorded. This cannot be undone. Continue?"
          )
        ) {
          startTransition(() => {
            void deleteAccount()
          })
        }
      }}
    >
      {isPending ? "Deleting…" : "Delete my account"}
    </Button>
  )
}
