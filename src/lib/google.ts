import type { createClient } from '@/lib/supabase/server'
import { decryptToken, encryptToken } from '@/lib/crypto'

// Google OAuth + API helpers. Read-only scopes by design.
// NOTE: gmail.readonly is a Google "restricted" scope — fine while the OAuth
// app is in Testing mode (allowlisted test users), but production requires
// Google verification (CASA). calendar.readonly is "sensitive" (lighter).
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
]

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<TokenResponse | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    console.error('Google token exchange failed:', await res.text())
    return null
  }
  return res.json()
}

async function refreshGoogleToken(refreshToken: string): Promise<TokenResponse | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) return null
  return res.json()
}

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

/**
 * Returns a valid Google access token for the user, refreshing (and
 * re-persisting) it when it's within a minute of expiry. Returns null when
 * not connected or the refresh token has been revoked.
 */
export async function getGoogleAccessToken(
  supabase: ServerSupabase,
  userId: string
): Promise<string | null> {
  if (!googleConfigured()) return null

  const { data: row } = await supabase
    .from('integrations')
    .select('id, access_token, refresh_token, token_expires_at, connected')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .maybeSingle()

  if (!row?.connected || !row.access_token) return null

  const expiresAt = row.token_expires_at ? new Date(row.token_expires_at).getTime() : 0
  const stillValid = expiresAt - Date.now() > 60_000

  const accessToken = decryptToken(row.access_token)
  if (stillValid && accessToken) return accessToken

  const refreshToken = row.refresh_token ? decryptToken(row.refresh_token) : null
  if (!refreshToken) return null

  const refreshed = await refreshGoogleToken(refreshToken)
  if (!refreshed) {
    // Refresh token revoked or expired — mark disconnected so the UI prompts a re-connect
    await supabase.from('integrations').update({ connected: false }).eq('id', row.id)
    return null
  }

  await supabase
    .from('integrations')
    .update({
      access_token: encryptToken(refreshed.access_token),
      token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    })
    .eq('id', row.id)

  return refreshed.access_token
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
}

export async function fetchTodayEvents(
  accessToken: string,
  timezone: string
): Promise<CalendarEvent[] | null> {
  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(now)
  dayEnd.setHours(23, 59, 59, 999)

  const params = new URLSearchParams({
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '8',
    timeZone: timezone,
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  )
  if (!res.ok) return null

  const data = await res.json()
  interface GoogleEvent {
    id: string
    summary?: string
    start?: { dateTime?: string; date?: string }
    end?: { dateTime?: string; date?: string }
  }
  return ((data.items ?? []) as GoogleEvent[]).map((e) => ({
    id: e.id,
    title: e.summary ?? '(no title)',
    start: e.start?.dateTime ?? e.start?.date ?? '',
    end: e.end?.dateTime ?? e.end?.date ?? '',
    allDay: Boolean(e.start?.date),
  }))
}

export interface EmailSummary {
  id: string
  from: string
  subject: string
  date: string
}

export async function fetchRecentEmails(accessToken: string): Promise<EmailSummary[] | null> {
  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX&q=is:unread',
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  )
  if (!listRes.ok) return null

  const list = await listRes.json()
  const ids: string[] = (list.messages ?? []).map((m: { id: string }) => m.id)

  const messages = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
      )
      if (!res.ok) return null
      const msg = await res.json()
      const headers: Array<{ name: string; value: string }> = msg.payload?.headers ?? []
      const get = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
      // "Jane Smith <jane@x.com>" → "Jane Smith"
      const from = get('From').replace(/<[^>]*>/g, '').replace(/"/g, '').trim() || get('From')
      return { id, from, subject: get('Subject') || '(no subject)', date: get('Date') }
    })
  )

  return messages.filter((m): m is EmailSummary => m !== null)
}
