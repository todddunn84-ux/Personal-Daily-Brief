import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tokenEncryptionAvailable } from '@/lib/crypto'
import { buildGoogleAuthUrl, googleConfigured } from '@/lib/google'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  if (!googleConfigured() || !tokenEncryptionAvailable()) {
    return NextResponse.redirect(`${origin}/integrations?error=google_not_configured`)
  }

  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('g_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const redirectUri = `${origin}/api/integrations/google/callback`
  return NextResponse.redirect(buildGoogleAuthUrl(redirectUri, state))
}
