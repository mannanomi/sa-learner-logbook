"use client"

import { useActionState, useState } from "react"
import { updateDrivingSession, deleteDrivingSession, type SessionActionState } from "./actions"
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
import { useRouter } from "next/navigation"
import { SuburbCombobox } from "@/components/suburb-combobox"
import { DriveTimeFields } from "./drive-time-fields"
import type { DrivingSessionRow, SupervisorRow } from "@/types/database"

const initialState: SessionActionState = {}

export function EditDriveForm({
  session,
  supervisors,
}: {
  session: DrivingSessionRow
  supervisors: SupervisorRow[]
}) {
  const updateWithId = updateDrivingSession.bind(null, session.id)
  const [state, formAction, isPending] = useActionState(updateWithId, initialState)
  const [date, setDate] = useState(session.session_date)
  const [startTime, setStartTime] = useState(session.start_time.slice(0, 5))
  const [endTime, setEndTime] = useState(session.end_time.slice(0, 5))
  const router = useRouter()

  return (
    <form action={formAction} className="flex flex-col gap-5 pb-6">
      <DriveTimeFields
        date={date}
        startTime={startTime}
        endTime={endTime}
        onDateChange={setDate}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="supervisorId">Supervisor</Label>
        <Select name="supervisorId" defaultValue={session.supervisor_id ?? undefined} required>
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startingLocation">From</Label>
          <SuburbCombobox
            id="startingLocation"
            name="startingLocation"
            defaultValue={session.starting_location}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="destination">To</Label>
          <SuburbCombobox id="destination" name="destination" defaultValue={session.destination} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SelectField name="weatherCondition" label="Weather" options={WEATHER_CONDITIONS} defaultValue={session.weather_condition} />
        <SelectField name="roadCondition" label="Road" options={ROAD_CONDITIONS} defaultValue={session.road_condition} />
        <SelectField name="trafficCondition" label="Traffic" options={TRAFFIC_CONDITIONS} defaultValue={session.traffic_condition} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={session.notes ?? ""} rows={2} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox name="learnerConfirmed" defaultChecked={session.learner_confirmed} className="mt-0.5" />
          I confirm the details of this driving session are accurate.
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox name="supervisorConfirmed" defaultChecked={session.supervisor_confirmed} className="mt-0.5" />
          My supervising driver confirms this session took place as recorded.
        </label>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="h-12 flex-1 text-base" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          className="h-12"
          onClick={async () => {
            if (confirm("Delete this drive? This cannot be undone.")) {
              await deleteDrivingSession(session.id)
              router.push("/history")
            }
          }}
        >
          Delete
        </Button>
      </div>
    </form>
  )
}

function SelectField({
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
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
