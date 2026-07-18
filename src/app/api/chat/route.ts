import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(20)
    .refine((msgs) => msgs[msgs.length - 1].role === 'user', {
      message: 'Last message must be from the user',
    }),
})

// Per-user sliding-window rate limit. In-memory, so it resets on cold start and
// is scoped to one server instance — a backstop against runaway spend, not a
// distributed limiter.
const RATE_WINDOW_MS = 5 * 60_000
const RATE_MAX_REQUESTS = 20
const requestLog = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const recent = (requestLog.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX_REQUESTS) {
    requestLog.set(userId, recent)
    return true
  }
  recent.push(now)
  requestLog.set(userId, recent)
  return false
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { reply: 'AI chat requires an ANTHROPIC_API_KEY in your environment variables. Add it to your .env.local file to enable this feature.' },
      { status: 200 }
    )
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: 'Too many messages — please wait a few minutes and try again.' },
      { status: 429 }
    )
  }

  const parsed = chatRequestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Fetch user's current dashboard context to include with the AI request
  const { data: tasks } = await supabase
    .from('tasks')
    .select('title, priority, completed, due_date')
    .eq('user_id', user.id)
    .eq('completed', false)
    .limit(10)

  const dashboardContext = `
The user's current dashboard data:
- Pending tasks: ${tasks?.map((t) => `"${t.title}" (${t.priority} priority${t.due_date ? `, due ${t.due_date}` : ''})`).join(', ') || 'none'}
- Calendar, email, and Slack integrations are not yet connected
`

  const anthropic = new Anthropic({ apiKey })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      output_config: { effort: 'low' },
      system: `You are DayBrief's AI assistant — a proactive personal assistant that helps users organize their day.
You have access to the user's current dashboard data. Be helpful, concise, and actionable.
When the user asks about their day, tasks, calendar, or email, reference their actual data.
If an integration isn't connected yet, encourage them to connect it on the Integrations page.

${dashboardContext}`,
      messages: parsed.data.messages,
    })

    const reply = response.content.find((block) => block.type === 'text')?.text
      ?? 'I had trouble generating a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
      return NextResponse.json(
        { reply: 'The AI service is busy right now. Please try again in a moment.' },
        { status: 200 }
      )
    }
    console.error('Chat error:', err)
    return NextResponse.json(
      { reply: 'I ran into an issue processing your request. Please try again.' },
      { status: 200 }
    )
  }
}
