import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { SESSION_COOKIE } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const secret = process.env.AUTH_SECRET

  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret))
      return NextResponse.next()
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', request.nextUrl.pathname)
  const response = NextResponse.redirect(loginUrl)
  if (token) response.cookies.delete(SESSION_COOKIE)
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
