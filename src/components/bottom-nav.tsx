"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, History, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/drives/new", label: "Add Drive", icon: PlusCircle, primary: true },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/supervisors", label: "Supervisors", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
                aria-label="Add Drive"
              >
                <span className="flex size-12 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-primary to-night text-primary-foreground shadow-lg shadow-primary/30">
                  <Icon className="size-6" />
                </span>
                <span className="-mt-2 text-[11px] font-medium text-primary">{label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
