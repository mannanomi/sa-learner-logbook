"use client"

import { useActionState, useRef, useEffect } from "react"
import { createSupervisor, type SupervisorActionState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialState: SupervisorActionState = {}

export function SupervisorForm() {
  const [state, formAction, isPending] = useActionState(createSupervisor, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state.error && !isPending) formRef.current?.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="relationship">Relationship</Label>
          <Input id="relationship" name="relationship" placeholder="Parent" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="licenceNumber">Licence number</Label>
          <Input id="licenceNumber" name="licenceNumber" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="licenceState">Licence state</Label>
          <Input id="licenceState" name="licenceState" placeholder="SA" defaultValue="SA" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="h-11">
        {isPending ? "Adding…" : "Add supervisor"}
      </Button>
    </form>
  )
}
