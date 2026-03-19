import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

const PROTECTED = ['/employees', '/settings']

export async function proxy(request: NextRequest) {
  // Let Auth0 handle its own routes first
  const authResponse = await auth0.middleware(request)
  if (authResponse.status !== 200) return authResponse

  const { pathname } = request.nextUrl
  const session = await auth0.getSession(request)

  // Redirect authenticated users away from the landing page
  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/employees', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/')) && !session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return authResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
