"use client"

import { useTransition } from "react"
import { deleteSupervisor } from "./actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { SupervisorRow } from "@/types/database"

export function SupervisorList({ supervisors }: { supervisors: SupervisorRow[] }) {
  const [isPending, startTransition] = useTransition()

  if (supervisors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No supervisors yet. Add one below.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {supervisors.map((s) => (
        <Card key={s.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {[s.relationship, s.licence_number && `Lic. ${s.licence_number}`]
                  .filter(Boolean)
                  .join(" · ") || "No details"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={() => startTransition(() => deleteSupervisor(s.id))}
              aria-label={`Delete ${s.name}`}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
