import { Car } from "lucide-react"

export function AuthBrandMark() {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-night text-primary-foreground shadow-lg shadow-primary/25">
        <Car className="size-7" />
      </span>
      <span className="text-sm font-medium text-muted-foreground">South Australia</span>
    </div>
  )
}
