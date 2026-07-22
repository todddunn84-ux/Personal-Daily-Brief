import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchRecentEmails, getGoogleAccessToken } from '@/lib/google'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessToken = await getGoogleAccessToken(supabase, user.id)
  if (!accessToken) return NextResponse.json({ connected: false, emails: [] })

  const emails = await fetchRecentEmails(accessToken)
  if (emails === null) {
    return NextResponse.json({ error: 'Could not load email' }, { status: 502 })
  }

  return NextResponse.json({ connected: true, emails })
}
