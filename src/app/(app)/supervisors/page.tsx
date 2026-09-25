import { listSupervisors } from "@/features/supervisors/data"
import { SupervisorList } from "@/features/supervisors/supervisor-list"
import { SupervisorForm } from "@/features/supervisors/supervisor-form"

export default async function SupervisorsPage() {
  const supervisors = await listSupervisors()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Supervisors</h1>
      <SupervisorList supervisors={supervisors} />
      <SupervisorForm />
    </div>
  )
}
