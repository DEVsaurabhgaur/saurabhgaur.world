import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /admin routes — constant-time comparison to prevent timing attacks
  if (pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('sg_admin')?.value ?? ''
    const expected = process.env.ADMIN_SECRET ?? ''

    // Constant-time comparison: avoids timing side-channel leak
    const tokenBuf = Buffer.from(adminToken.padEnd(expected.length, '\0'))
    const expectedBuf = Buffer.from(expected.padEnd(adminToken.length, '\0'))
    const isValid =
      adminToken.length === expected.length &&
      tokenBuf.equals(expectedBuf)

    if (!isValid) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Add security headers to all responses
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
