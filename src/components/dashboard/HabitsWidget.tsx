'use client'

import { useEffect, useState } from 'react'
import { Repeat, Plus, Trash2, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  name: string
  checkedToday: boolean
}

function localToday(): string {
  return new Intl.DateTimeFormat('en-CA').format(new Date())
}

export function HabitsWidget() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [newHabit, setNewHabit] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [])

  async function loadHabits() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    const today = localToday()
    const [{ data: rows }, { data: checks }] = await Promise.all([
      supabase.from('habits').select('id, name').eq('user_id', user.id).order('created_at'),
      supabase.from('habit_checks').select('habit_id').eq('user_id', user.id).eq('check_date', today),
    ])

    const checked = new Set(checks?.map((c) => c.habit_id))
    setHabits(rows?.map((h) => ({ ...h, checkedToday: checked.has(h.id) })) ?? [])
    setLoading(false)
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    const name = newHabit.trim()
    if (!name) return
    setNewHabit('')
    setShowInput(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('habits')
      .insert({ user_id: user.id, name })
      .select('id, name')
      .single()

    if (data) setHabits((prev) => [...prev, { ...data, checkedToday: false }])
  }

  async function toggleHabit(habit: Habit) {
    setHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? { ...h, checkedToday: !h.checkedToday } : h))
    )

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = localToday()
    if (habit.checkedToday) {
      await supabase.from('habit_checks').delete().eq('habit_id', habit.id).eq('check_date', today)
    } else {
      await supabase
        .from('habit_checks')
        .upsert({ habit_id: habit.id, user_id: user.id, check_date: today })
    }
  }

  async function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', id)
  }

  const doneCount = habits.filter((h) => h.checkedToday).length

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Repeat className="w-3.5 h-3.5" /> Habits
          {habits.length > 0 && (
            <span className="ml-1 text-xs bg-brand-50 text-brand-400 rounded-full px-1.5 py-0.5 normal-case tracking-normal">
              {doneCount}/{habits.length}
            </span>
          )}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowInput(!showInput)} className="h-7 w-7">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showInput && (
          <form onSubmit={addHabit} className="flex gap-2">
            <input
              autoFocus
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              maxLength={100}
              placeholder="e.g. Morning walk"
              className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
              onKeyDown={(e) => e.key === 'Escape' && setShowInput(false)}
            />
            <Button size="sm" type="submit">Add</Button>
          </form>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="skeleton h-9 w-full" />
            <div className="skeleton h-9 w-full" />
          </div>
        )}

        {!loading && habits.length === 0 && (
          <div className="text-center py-6">
            <Repeat className="w-8 h-8 text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500">Build a daily routine</p>
            <button
              onClick={() => setShowInput(true)}
              className="text-xs text-brand-400 hover:text-brand-500 mt-1 font-medium"
            >
              Track your first habit →
            </button>
          </div>
        )}

        {habits.map((habit) => (
          <div
            key={habit.id}
            className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-800 transition-colors"
          >
            <button
              onClick={() => toggleHabit(habit)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-all shrink-0 flex items-center justify-center',
                habit.checkedToday
                  ? 'bg-success border-success'
                  : 'border-surface-600 hover:border-success'
              )}
            >
              {habit.checkedToday && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <span
              className={cn(
                'flex-1 text-sm',
                habit.checkedToday ? 'text-surface-500' : 'text-surface-200'
              )}
            >
              {habit.name}
            </span>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="opacity-0 group-hover:opacity-100 text-surface-600 hover:text-danger transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
