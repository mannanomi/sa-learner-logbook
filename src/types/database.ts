// NOTE: these use `type`, not `interface`. The installed @supabase/postgrest-js
// version's insert()/update() generics resolve to `never` when a table's Row
// type is declared via `interface` and referenced by name in the Database
// type below — confirmed by isolated repro. `type` aliases with the same
// shape work correctly. Keep these as `type` unless that's fixed upstream.

export type ProfileRow = {
  id: string
  full_name: string | null
  email: string
  state: string
  permit_date: string | null
  target_licence_date: string | null
  created_at: string
  updated_at: string
}

export type SupervisorRow = {
  id: string
  learner_id: string
  name: string
  licence_number: string | null
  licence_state: string | null
  relationship: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type SyncStatus = "synced" | "pending" | "conflict" | "error"

export type DrivingSessionRow = {
  id: string
  learner_id: string
  supervisor_id: string | null
  session_date: string
  start_time: string
  end_time: string
  total_minutes: number
  day_minutes: number
  night_minutes: number
  starting_location: string
  destination: string
  weather_condition: string
  road_condition: string
  traffic_condition: string
  notes: string | null
  learner_confirmed: boolean
  supervisor_confirmed: boolean
  client_id: string
  sync_status: SyncStatus
  created_at: string
  updated_at: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13"
  }
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Partial<ProfileRow> & { id: string; email: string }
        Update: Partial<ProfileRow>
        Relationships: []
      }
      supervisors: {
        Row: SupervisorRow
        Insert: Partial<SupervisorRow> & { learner_id: string; name: string }
        Update: Partial<SupervisorRow>
        Relationships: []
      }
      driving_sessions: {
        Row: DrivingSessionRow
        Insert: Partial<DrivingSessionRow> & {
          learner_id: string
          session_date: string
          start_time: string
          end_time: string
          total_minutes: number
          day_minutes: number
          night_minutes: number
          starting_location: string
          destination: string
          weather_condition: string
          road_condition: string
          traffic_condition: string
        }
        Update: Partial<DrivingSessionRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      delete_own_account: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
