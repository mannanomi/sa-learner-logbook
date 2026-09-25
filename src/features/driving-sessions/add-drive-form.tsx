"use client"

import { useActionState, useState } from "react"
import { createDrivingSession, type SessionActionState } from "./actions"
import {
  ROAD_CONDITIONS,
  TRAFFIC_CONDITIONS,
  WEATHER_CONDITIONS,
} from "@/lib/validation/driving-session"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SuburbCombobox } from "@/components/suburb-combobox"
import { DriveTimeFields } from "./drive-time-fields"
import type { SupervisorRow } from "@/types/database"

const initialState: SessionActionState = {}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function nowHHmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

const conditionLabels: Record<string, string> = {
  clear: "Clear",
  rain: "Rain",
  fog: "Fog",
  overcast: "Overcast",
  storm: "Storm",
  dry: "Dry",
  wet: "Wet",
  gravel: "Gravel",
  icy: "Icy",
  "under-construction": "Roadworks",
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
}

export function AddDriveForm({ supervisors }: { supervisors: SupervisorRow[] }) {
  const [state, formAction, isPending] = useActionState(createDrivingSession, initialState)
  const [date, setDate] = useState(todayIso())
  const [startTime, setStartTime] = useState(nowHHmm())
  const [endTime, setEndTime] = useState(nowHHmm())

  return (
    <form action={formAction} className="flex flex-col gap-5 pb-6">
      {supervisors.length === 0 && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          You need a supervisor before recording a drive.{" "}
          <a href="/supervisors" className="font-medium underline">
            Add one first
          </a>
          .
        </p>
      )}

      <DriveTimeFields
        date={date}
        startTime={startTime}
        endTime={endTime}
        onDateChange={setDate}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        maxDate={todayIso()}
        endTimeError={state.fieldErrors?.endTime}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supervisorId">Supervisor</Label>
        <Select name="supervisorId" required>
          <SelectTrigger id="supervisorId" className="h-11 w-full">
            <SelectValue placeholder="Select supervisor" />
          </SelectTrigger>
          <SelectContent>
            {supervisors.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.supervisorId && (
          <p className="text-sm text-destructive">{state.fieldErrors.supervisorId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startingLocation">From</Label>
          <SuburbCombobox id="startingLocation" name="startingLocation" placeholder="Home suburb" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="destination">To</Label>
          <SuburbCombobox id="destination" name="destination" placeholder="Destination suburb" />
        </div>
      </div>
      {state.fieldErrors?.startingLocation && (
        <p className="-mt-3 text-sm text-destructive">{state.fieldErrors.startingLocation}</p>
      )}
      {state.fieldErrors?.destination && (
        <p className="-mt-3 text-sm text-destructive">{state.fieldErrors.destination}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <ConditionSelect
          name="weatherCondition"
          label="Weather"
          options={WEATHER_CONDITIONS}
          defaultValue="clear"
        />
        <ConditionSelect name="roadCondition" label="Road" options={ROAD_CONDITIONS} defaultValue="dry" />
        <ConditionSelect
          name="trafficCondition"
          label="Traffic"
          options={TRAFFIC_CONDITIONS}
          defaultValue="light"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" placeholder="Parallel parking practice…" rows={2} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox name="learnerConfirmed" required className="mt-0.5" />
          I confirm the details of this driving session are accurate.
        </label>
        {state.fieldErrors?.learnerConfirmed && (
          <p className="text-sm text-destructive">{state.fieldErrors.learnerConfirmed}</p>
        )}
        <label className="flex items-start gap-3 text-sm">
          <Checkbox name="supervisorConfirmed" required className="mt-0.5" />
          My supervising driver confirms this session took place as recorded.
        </label>
        {state.fieldErrors?.supervisorConfirmed && (
          <p className="text-sm text-destructive">{state.fieldErrors.supervisorConfirmed}</p>
        )}
      </div>

      {state.error && !state.fieldErrors && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        size="lg"
        className="h-12 text-base"
        disabled={isPending || supervisors.length === 0}
      >
        {isPending ? "Saving…" : "Save drive"}
      </Button>
    </form>
  )
}

function ConditionSelect({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string
  label: string
  options: readonly string[]
  defaultValue: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger id={name} className="h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {conditionLabels[o] ?? o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
