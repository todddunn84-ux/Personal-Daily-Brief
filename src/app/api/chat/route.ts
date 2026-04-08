import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const { message } = await request.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Fetch user's current dashboard context to include with the AI request
  const [{ data: tasks }] = await Promise.all([
    supabase.from('tasks').select('title, priority, completed, due_date').eq('user_id', user.id).eq('completed', false).limit(10),
  ])

  const dashboardContext = `
The user's current dashboard data:
- Pending tasks: ${tasks?.map((t) => `"${t.title}" (${t.priority} priority${t.due_date ? `, due ${t.due_date}` : ''})`).join(', ') || 'none'}
- Calendar, email, and Slack integrations are not yet connected
`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are DayBrief's AI assistant — a proactive personal assistant that helps users organize their day.
You have access to the user's current dashboard data. Be helpful, concise, and actionable.
When the user asks about their day, tasks, calendar, or email, reference their actual data.
If an integration isn't connected yet, encourage them to connect it on the Integrations page.

${dashboardContext}`,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic API error:', err)
      throw new Error('AI request failed')
    }

    const data = await res.json()
    const reply = data.content[0]?.text ?? 'I had trouble generating a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { reply: 'I ran into an issue processing your request. Please try again.' },
      { status: 200 }
    )
  }
}
