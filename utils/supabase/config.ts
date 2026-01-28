import { CookieOptions } from '@supabase/ssr'

export const COOKIE_OPTIONS: CookieOptions = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}
