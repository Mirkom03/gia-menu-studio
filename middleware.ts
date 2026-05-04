import { NextResponse, type NextRequest } from 'next/server'

// TEMP 2026-05-04: Supabase project uwipvrhvuswgyyothtdp eliminado (NXDOMAIN).
// Bypass del middleware para evitar MIDDLEWARE_INVOCATION_TIMEOUT.
// Restaurar `return await updateSession(request)` cuando Supabase vuelva.
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - Public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
