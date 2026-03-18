import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Použít Node.js runtime místo Edge runtime kvůli kompatibilitě
export const runtime = 'nodejs'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Pouze přesměrování root (/) na /admin
  if (url.pathname === '/') {
    const newUrl = new URL('/admin', url)
    return NextResponse.redirect(newUrl, 302)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Pouze root URL
    '/'
  ],
}