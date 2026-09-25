import Link from "next/link"
import { listDrivingSessions } from "@/features/driving-sessions/data"
import { listSupervisors } from "@/features/supervisors/data"
import { formatMinutesAsHoursMinutes } from "@/lib/calculations/driving-segments"
import { ROAD_CONDITIONS, TRAFFIC_CONDITIONS, WEATHER_CONDITIONS } from "@/lib/validation/driving-session"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HistoryPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    supervisorId?: string
    dayNight?: "day" | "night"
    weather?: string
    road?: string
    traffic?: string
  }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams
  const [sessions, supervisors] = await Promise.all([
    listDrivingSessions({
      fromDate: params.from,
      toDate: params.to,
      supervisorId: params.supervisorId,
      dayNight: params.dayNight,
      weatherCondition: params.weather,
      roadCondition: params.road,
      trafficCondition: params.traffic,
    }),
    listSupervisors(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Driving history</h1>

      <form className="grid grid-cols-2 gap-2 rounded-lg border p-3 text-sm" method="get">
        <input type="date" name="from" defaultValue={params.from} className="rounded border px-2 py-1.5" />
        <input type="date" name="to" defaultValue={params.to} className="rounded border px-2 py-1.5" />
        <select name="supervisorId" defaultValue={params.supervisorId ?? ""} className="rounded border px-2 py-1.5">
          <option value="">Any supervisor</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="dayNight" defaultValue={params.dayNight ?? ""} className="rounded border px-2 py-1.5">
          <option value="">Day &amp; night</option>
          <option value="day">Day only</option>
          <option value="night">Night only</option>
        </select>
        <select name="weather" defaultValue={params.weather ?? ""} className="rounded border px-2 py-1.5">
          <option value="">Any weather</option>
          {WEATHER_CONDITIONS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <select name="road" defaultValue={params.road ?? ""} className="rounded border px-2 py-1.5">
          <option value="">Any road</option>
          {ROAD_CONDITIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select name="traffic" defaultValue={params.traffic ?? ""} className="col-span-2 rounded border px-2 py-1.5">
          <option value="">Any traffic</option>
          {TRAFFIC_CONDITIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="col-span-2 rounded-md bg-primary py-2 font-medium text-primary-foreground">
          Filter
        </button>
      </form>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No drives match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
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
                    <span className="text-sm font-medium">{formatMinutesAsHoursMinutes(s.total_minutes)}</span>
                    <div className="flex gap-1">
                      {s.night_minutes > 0 && (
                        <Badge className="border-night/25 bg-night/15 text-[10px] text-night">
                          Night
                        </Badge>
                      )}
                      {!s.supervisor_confirmed && (
                        <Badge className="border-warning/40 bg-warning/15 text-[10px] text-warning">
                          Unconfirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
