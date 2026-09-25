import { notFound } from "next/navigation"
import { getDrivingSession } from "@/features/driving-sessions/data"
import { listSupervisors } from "@/features/supervisors/data"
import { EditDriveForm } from "@/features/driving-sessions/edit-drive-form"

export default async function DrivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, supervisors] = await Promise.all([getDrivingSession(id), listSupervisors()])

  if (!session) notFound()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Edit drive</h1>
      <EditDriveForm session={session} supervisors={supervisors} />
    </div>
  )
}
