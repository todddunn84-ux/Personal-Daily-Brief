import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/crypto'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row } = await supabase
    .from('integrations')
    .select('id, refresh_token, access_token')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .maybeSingle()

  if (row) {
    // Best-effort revoke at Google so the grant disappears from the user's
    // account permissions too
    const token =
      (row.refresh_token && decryptToken(row.refresh_token)) ||
      (row.access_token && decryptToken(row.access_token))
    if (token) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      }).catch(() => {})
    }
    await supabase.from('integrations').delete().eq('id', row.id)
  }

  return NextResponse.json({ ok: true })
}
