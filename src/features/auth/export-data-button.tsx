"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportDataButton() {
  return (
    <Button variant="outline" asChild className="gap-2">
      <a href="/api/export" download>
        <Download className="size-4" />
        Download my data (JSON)
      </a>
    </Button>
  )
}
