import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchTodayEvents, getGoogleAccessToken } from '@/lib/google'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessToken = await getGoogleAccessToken(supabase, user.id)
  if (!accessToken) return NextResponse.json({ connected: false, events: [] })

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single()

  const events = await fetchTodayEvents(accessToken, profile?.timezone ?? 'America/New_York')
  if (events === null) {
    return NextResponse.json({ error: 'Could not load calendar' }, { status: 502 })
  }

  return NextResponse.json({ connected: true, events })
}
