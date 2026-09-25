import { DashboardView } from "@/features/dashboard/dashboard-view"
import { getAllSessionMinutes, getRecentSessions } from "@/features/driving-sessions/data"

export default async function DashboardPage() {
  const [sessionMinutes, recentSessions] = await Promise.all([
    getAllSessionMinutes(),
    getRecentSessions(5),
  ])

  return <DashboardView sessionMinutes={sessionMinutes} recentSessions={recentSessions} />
}
