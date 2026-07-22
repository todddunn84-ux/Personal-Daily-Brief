import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  // Only allow same-origin paths — blocks open-redirect via ?next=
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // PKCE exchange needs the code_verifier cookie from the browser that
    // STARTED the flow. Opening an email link on a different device (very
    // common: sign up on desktop, tap the link on your phone) lands here with
    // no verifier — but Supabase has already verified the email by that
    // point, so send them to sign in rather than showing a failure.
    if (error.message.toLowerCase().includes('code verifier')) {
      return NextResponse.redirect(`${origin}/login?notice=confirmed`)
    }
  }

  // Supabase forwards failures (e.g. expired links) as error params
  if (searchParams.get('error_code') === 'otp_expired') {
    return NextResponse.redirect(`${origin}/login?error=link_expired`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
