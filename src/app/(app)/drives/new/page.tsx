import { AddDriveForm } from "@/features/driving-sessions/add-drive-form"
import { listSupervisors } from "@/features/supervisors/data"

export default async function AddDrivePage() {
  const supervisors = await listSupervisors()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Add drive</h1>
      <AddDriveForm supervisors={supervisors} />
    </div>
  )
}
