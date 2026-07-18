import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rate-limit'

/** Today's date (YYYY-MM-DD) in the user's timezone. */
function todayIn(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-CA').format(new Date())
  }
}

async function generateBrief(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  firstName: string,
  timezone: string,
  today: string
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const [{ data: tasks }, { data: habits }, { data: checks }] = await Promise.all([
    supabase
      .from('tasks')
      .select('title, priority, due_date')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(15),
    supabase.from('habits').select('id, name').eq('user_id', userId),
    supabase.from('habit_checks').select('habit_id').eq('user_id', userId).eq('check_date', today),
  ])

  const checked = new Set(checks?.map((c) => c.habit_id))
  const habitLines = habits?.map((h) => `${h.name}${checked.has(h.id) ? ' (done today)' : ''}`) ?? []
  const taskLines =
    tasks?.map((t) => `"${t.title}" (${t.priority}${t.due_date ? `, due ${t.due_date}` : ''})`) ?? []

  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    output_config: { effort: 'low' },
    system: `You write DayBrief's morning briefing — a short, warm, professional summary that helps the user start their day with clarity. Write 2-4 sentences of flowing prose (no lists, no headings, no emoji). Mention what deserves attention first: overdue or due-today tasks, then high-priority work, then habits not yet done. If their plate is clear, say so encouragingly. Address the user directly ("you"). Today is ${today} (${timezone}).`,
    messages: [
      {
        role: 'user',
        content: `Write today's brief for ${firstName}.
Pending tasks: ${taskLines.length ? taskLines.join(', ') : 'none'}
Habits: ${habitLines.length ? habitLines.join(', ') : 'none tracked'}`,
      },
    ],
  })

  return response.content.find((b) => b.type === 'text')?.text ?? null
}

async function handleBrief(forceRefresh: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, timezone')
    .eq('id', user.id)
    .single()

  const timezone = profile?.timezone ?? 'America/New_York'
  const today = todayIn(timezone)

  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from('briefs')
      .select('content')
      .eq('user_id', user.id)
      .eq('brief_date', today)
      .maybeSingle()

    if (cached) return NextResponse.json({ content: cached.content, date: today })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ content: null, needsKey: true, date: today })
  }

  if (isRateLimited('brief', user.id, 6, 60 * 60_000)) {
    return NextResponse.json(
      { error: 'Brief refresh limit reached — try again later.' },
      { status: 429 }
    )
  }

  try {
    const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
    const content = await generateBrief(supabase, user.id, firstName, timezone, today)
    if (!content) throw new Error('Empty brief')

    await supabase
      .from('briefs')
      .upsert({ user_id: user.id, brief_date: today, content }, { onConflict: 'user_id,brief_date' })

    return NextResponse.json({ content, date: today })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json({ error: 'Could not generate your brief right now.' }, { status: 502 })
  }
}

export async function GET() {
  return handleBrief(false)
}

export async function POST() {
  return handleBrief(true)
}
