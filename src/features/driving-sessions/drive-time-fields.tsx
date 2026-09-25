"use client"

import { Clock, Sun, Moon, CalendarDays } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { calculateDrivingSegments, formatMinutesAsHoursMinutes } from "@/lib/calculations/driving-segments"
import { cn } from "@/lib/utils"

const DURATION_PRESETS = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "1h", minutes: 60 },
  { label: "1.5h", minutes: 90 },
  { label: "2h", minutes: 120 },
]

function nowHHmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/** Adds minutes to a "HH:mm" time, wrapping past midnight back to 00:00-23:59. */
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number)
  const total = ((h * 60 + m + minutes) % (24 * 60) + 24 * 60) % (24 * 60)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

interface DriveTimeFieldsProps {
  date: string
  startTime: string
  endTime: string
  onDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  maxDate?: string
  endTimeError?: string
}

export function DriveTimeFields({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  maxDate,
  endTimeError,
}: DriveTimeFieldsProps) {
  const segments =
    date && startTime && endTime && startTime !== endTime
      ? calculateDrivingSegments(date, startTime, endTime)
      : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <CalendarDays className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="date"
            name="date"
            type="date"
            className="h-11 text-base"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            max={maxDate}
            required
          />
        </InputGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="startTime">Start</Label>
            <button
              type="button"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => onStartTimeChange(nowHHmm())}
            >
              Now
            </button>
          </div>
          <InputGroup className="h-11">
            <InputGroupAddon>
              <Clock className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="startTime"
              name="startTime"
              type="time"
              className="h-11 text-base"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              required
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endTime">End</Label>
          <InputGroup className="h-11">
            <InputGroupAddon>
              <Clock className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="endTime"
              name="endTime"
              type="time"
              className="h-11 text-base"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              required
            />
          </InputGroup>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DURATION_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-3 text-xs"
            disabled={!startTime}
            onClick={() => onEndTimeChange(addMinutesToTime(startTime, preset.minutes))}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {endTimeError && <p className="text-sm text-destructive">{endTimeError}</p>}

      {segments && (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm"
          )}
        >
          <span className="font-medium text-primary">
            {formatMinutesAsHoursMinutes(segments.totalMinutes)} total
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground">
              <Sun className="size-3.5 text-day" />
              {formatMinutesAsHoursMinutes(segments.dayMinutes)}
            </span>
            <span className="flex items-center gap-1 text-night">
              <Moon className="size-3.5 text-night" />
              {formatMinutesAsHoursMinutes(segments.nightMinutes)}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
