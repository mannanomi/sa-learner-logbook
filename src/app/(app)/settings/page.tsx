import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DeleteAccountButton } from "@/features/auth/delete-account-button"
import { ExportDataButton } from "@/features/auth/export-data-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Settings</h1>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{user?.email}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Your data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Download a copy of everything stored about you (profile, supervisors, driving sessions).
          </p>
          <ExportDataButton />
          <Button variant="outline" asChild>
            <Link href="/export">Printable logbook / PDF export</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all recorded driving sessions. This cannot be undone.
          </p>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  )
}
