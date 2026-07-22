import { CalendarClock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

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

  const overdueCount = overdue.count ?? 0

  const stats = [
    {
      icon: CalendarClock,
      label: 'Due today',
      value: String(dueToday.count ?? 0),
      iconTone: 'text-brand-400',
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      value: String(overdueCount),
      iconTone: overdueCount > 0 ? 'text-danger' : 'text-surface-600',
      valueTone: overdueCount > 0 ? 'text-danger' : undefined,
    },
    {
      icon: CheckCircle2,
      label: 'Done this week',
      value: String(completedWeek.count ?? 0),
      iconTone: 'text-success',
    },
    {
      icon: Flame,
      label: 'Habits today',
      value: `${habitsDone.count ?? 0}/${habitsTotal.count ?? 0}`,
      iconTone: 'text-accent',
    },
  ]

  return (
    <div className="bg-surface-900 border border-surface-750 rounded-xl shadow-xs grid grid-cols-2 lg:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, iconTone, valueTone }, i) => (
        <div
          key={label}
          className={cn(
            'px-4 md:px-5 py-4 flex items-start justify-between gap-3 border-surface-800',
            i % 2 === 1 && 'border-l',
            i >= 2 && 'border-t lg:border-t-0',
            i > 0 && 'lg:border-l'
          )}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 mb-1 truncate">
              {label}
            </p>
            <p className={cn('text-2xl font-semibold leading-none tabular-nums text-surface-100', valueTone)}>
              {value}
            </p>
          </div>
          <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', iconTone)} />
        </div>
      ))}
    </div>
  )
}
