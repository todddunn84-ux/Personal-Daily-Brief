import { CalendarClock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function todayIn(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-CA').format(new Date())
  }
}

export async function StatsRow({ userId, timezone }: { userId: string; timezone: string }) {
  const supabase = await createClient()
  const today = todayIn(timezone)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [dueToday, overdue, completedWeek, habitsTotal, habitsDone] = await Promise.all([
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('completed', false).eq('due_date', today),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('completed', false).lt('due_date', today),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('completed', true).gte('completed_at', weekAgo),
    supabase
      .from('habits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('habit_checks')
      .select('habit_id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('check_date', today),
  ])

  const stats = [
    {
      icon: CalendarClock,
      label: 'Due today',
      value: dueToday.count ?? 0,
      tone: 'text-brand-400 bg-brand-50',
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      value: overdue.count ?? 0,
      tone: (overdue.count ?? 0) > 0 ? 'text-danger bg-danger/10' : 'text-surface-500 bg-surface-800',
    },
    {
      icon: CheckCircle2,
      label: 'Done this week',
      value: completedWeek.count ?? 0,
      tone: 'text-success bg-success/10',
    },
    {
      icon: Flame,
      label: 'Habits today',
      value: `${habitsDone.count ?? 0}/${habitsTotal.count ?? 0}`,
      tone: 'text-accent bg-accent-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, tone }) => (
        <div
          key={label}
          className="bg-surface-900 border border-surface-750 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-xs"
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-semibold text-surface-100 leading-tight tabular-nums">{value}</p>
            <p className="text-xs text-surface-500 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
