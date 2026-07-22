import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto'
import { exchangeGoogleCode, GOOGLE_SCOPES } from '@/lib/google'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  const cookieStore = await cookies()
  const expectedState = cookieStore.get('g_oauth_state')?.value
  cookieStore.delete('g_oauth_state')

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/integrations?error=google_failed`)
  }

  const tokens = await exchangeGoogleCode(code, `${origin}/api/integrations/google/callback`)
  if (!tokens) {
    return NextResponse.redirect(`${origin}/integrations?error=google_failed`)
  }

  const { error } = await supabase.from('integrations').upsert(
    {
      user_id: user.id,
      provider: 'google',
      access_token: encryptToken(tokens.access_token),
      // Google only returns refresh_token on first consent (prompt=consent
      // forces it) — keep the existing one if a re-connect omits it.
      ...(tokens.refresh_token && { refresh_token: encryptToken(tokens.refresh_token) }),
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: GOOGLE_SCOPES.join(' '),
      connected: true,
    },
    { onConflict: 'user_id,provider' }
  )

  if (error) {
    console.error('Failed to store Google integration:', error)
    return NextResponse.redirect(`${origin}/integrations?error=google_failed`)
  }

  return NextResponse.redirect(`${origin}/integrations?connected=google`)
}
