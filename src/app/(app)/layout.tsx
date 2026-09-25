import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { signOut } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Car } from "lucide-react"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-night text-primary-foreground">
              <Car className="size-4" />
            </span>
            SA Learner Logbook
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="Settings">
              <Link href="/settings">
                <Settings className="size-4" />
              </Link>
            </Button>
            <form action={signOut}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Log out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
