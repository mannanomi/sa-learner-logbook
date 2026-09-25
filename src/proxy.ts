import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export default async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, manifest, service worker, icons
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/).*)",
  ],
}
