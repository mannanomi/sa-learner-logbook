"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signIn, type AuthActionState } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AuthBrandMark } from "@/components/auth-brand-mark"

const initialState: AuthActionState = {}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState)

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/8 via-background to-night/8 p-4">
      <div className="w-full max-w-sm">
        <AuthBrandMark />
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Log in</CardTitle>
            <CardDescription>Track your SA learner driving hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" size="lg" disabled={isPending} className="mt-2 h-11">
                {isPending ? "Logging in…" : "Log in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
