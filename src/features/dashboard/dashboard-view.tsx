import Link from "next/link"
import { Sun, Moon, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatMinutesAsHoursMinutes } from "@/lib/calculations/driving-segments"
import { calculateProgress } from "@/lib/calculations/progress"
import type { DrivingSessionRow } from "@/types/database"

interface DashboardViewProps {
  sessionMinutes: { session_date: string; day_minutes: number; night_minutes: number }[]
  recentSessions: DrivingSessionRow[]
}

export function DashboardView({ sessionMinutes, recentSessions }: DashboardViewProps) {
  const progress = calculateProgress(
    sessionMinutes.map((s) => ({
      date: s.session_date,
      dayMinutes: s.day_minutes,
      nightMinutes: s.night_minutes,
    }))
  )

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Gauge className="size-3.5" />
            </span>
            Total supervised driving
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-primary">
              {formatMinutesAsHoursMinutes(progress.totalMinutes)}
            </span>
            <span className="text-muted-foreground">
              / {formatMinutesAsHoursMinutes(progress.requiredTotalMinutes)}
            </span>
          </div>
          <Progress value={progress.percentComplete} className="h-2.5" />
          <p className="text-sm text-muted-foreground">{progress.percentComplete}% complete</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-day/25 bg-day/8">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sun className="size-3.5 text-day" />
              Day hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-semibold text-foreground">
              {formatMinutesAsHoursMinutes(progress.dayMinutes)}
            </span>
          </CardContent>
        </Card>
        <Card className="border-night/25 bg-night/8">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-night">
              <Moon className="size-3.5 text-night" />
              Night hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-semibold text-night">
              {formatMinutesAsHoursMinutes(progress.nightMinutes)}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-night/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-night/15 text-night">
              <Moon className="size-3.5" />
            </span>
            Night progress
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-semibold text-night">
              {formatMinutesAsHoursMinutes(progress.nightMinutes)}
            </span>
            <span className="text-muted-foreground">
              / {formatMinutesAsHoursMinutes(progress.requiredNightMinutes)}
            </span>
          </div>
          <Progress
            value={progress.nightPercentComplete}
            className="h-2"
            indicatorClassName="bg-night"
          />
          {progress.remainingNightMinutes > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatMinutesAsHoursMinutes(progress.remainingNightMinutes)} remaining
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent drives</h2>
          <Link href="/history" className="text-sm text-primary underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No drives recorded yet. Tap Add Drive to log your first session.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <Link key={s.id} href={`/drives/${s.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(s.session_date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.starting_location} → {s.destination}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium">
                        {formatMinutesAsHoursMinutes(s.total_minutes)}
                      </span>
                      {s.night_minutes > 0 && (
                        <Badge className="border-night/25 bg-night/15 text-[10px] text-night">
                          <Moon className="size-2.5" />
                          {formatMinutesAsHoursMinutes(s.night_minutes)} night
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
