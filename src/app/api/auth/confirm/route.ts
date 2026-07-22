import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Email confirmation via token_hash — unlike the PKCE ?code= flow, this works
// no matter which device or browser the link is opened on, and signs the user
// in directly. Supabase email templates should link here:
//   {{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const nextParam = searchParams.get('next') ?? '/dashboard'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    if (error.code === 'otp_expired') {
      return NextResponse.redirect(`${origin}/login?error=link_expired`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirm_failed`)
}
