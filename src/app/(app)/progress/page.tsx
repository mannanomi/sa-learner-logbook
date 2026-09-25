import { Sun, Moon, Gauge, Hourglass, TrendingUp, CalendarCheck2 } from "lucide-react"
import { getAllSessionMinutes } from "@/features/driving-sessions/data"
import { calculateDrivingAverages, calculateProgress, estimateCompletionDate } from "@/lib/calculations/progress"
import { formatMinutesAsHoursMinutes } from "@/lib/calculations/driving-segments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default async function ProgressPage() {
  const rows = await getAllSessionMinutes()
  const sessions = rows.map((r) => ({
    date: r.session_date,
    dayMinutes: r.day_minutes,
    nightMinutes: r.night_minutes,
  }))

  const progress = calculateProgress(sessions)
  const averages = calculateDrivingAverages(sessions)
  const completion = estimateCompletionDate(sessions)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Progress</h1>

      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Total hours"
          value={formatMinutesAsHoursMinutes(progress.totalMinutes)}
          icon={Gauge}
          tone="primary"
        />
        <Stat
          label="Remaining"
          value={formatMinutesAsHoursMinutes(progress.remainingTotalMinutes)}
          icon={Hourglass}
          tone="warning"
        />
        <Stat
          label="Day hours"
          value={formatMinutesAsHoursMinutes(progress.dayMinutes)}
          icon={Sun}
          tone="day"
        />
        <Stat
          label="Night hours"
          value={formatMinutesAsHoursMinutes(progress.nightMinutes)}
          icon={Moon}
          tone="night"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-success/15 text-success">
              <TrendingUp className="size-3.5" />
            </span>
            Driving pace
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weekly average</span>
            <span className="font-medium">{formatMinutesAsHoursMinutes(averages.weeklyAverageMinutes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly average</span>
            <span className="font-medium">{formatMinutesAsHoursMinutes(averages.monthlyAverageMinutes)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CalendarCheck2 className="size-3.5" />
            </span>
            Estimated completion
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {completion.estimatedDate ? (
            <p className="text-base font-medium text-primary">
              {new Date(completion.estimatedDate).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : (
            <p className="text-muted-foreground">
              {completion.reason ?? "Not enough data to estimate a completion date yet."}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Estimate only, based on your recent driving pace — not a guarantee.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const toneStyles = {
  primary: { border: "border-primary/20", bg: "bg-primary/8", icon: "bg-primary/15 text-primary" },
  day: { border: "border-day/25", bg: "bg-day/8", icon: "bg-day/20 text-day" },
  night: { border: "border-night/25", bg: "bg-night/8", icon: "bg-night/15 text-night" },
  warning: { border: "border-warning/25", bg: "bg-warning/10", icon: "bg-warning/20 text-warning" },
} as const

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: keyof typeof toneStyles
}) {
  const style = toneStyles[tone]
  return (
    <Card className={cn(style.border, style.bg)}>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className={cn("flex size-5 items-center justify-center rounded-full", style.icon)}>
            <Icon className="size-3" />
          </span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  )
}
