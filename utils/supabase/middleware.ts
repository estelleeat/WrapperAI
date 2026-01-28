import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_OPTIONS } from './config'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, { ...options, ...COOKIE_OPTIONS })
          })
        },
      },
      cookieOptions: COOKIE_OPTIONS,
    }
  )

  // IMPORTANT: Avoid writing complex logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protection des routes /workspace
  if (request.nextUrl.pathname.startsWith('/workspace') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirection inverse : si connecté et tente d'aller sur /login ou /register
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  return response
}
