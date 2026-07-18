'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Checkbox from '@radix-ui/react-checkbox'
import {
  SlidersHorizontal, ChevronUp, ChevronDown, Check, X, GripVertical,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WIDGETS, type WidgetLayoutItem } from '@/lib/widgets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { DailyBriefCard } from './DailyBriefCard'
import { TasksWidget } from './TasksWidget'
import { WeatherWidget } from './WeatherWidget'
import { HabitsWidget } from './HabitsWidget'
import { NotesWidget } from './NotesWidget'
import { FocusTimerWidget } from './FocusTimerWidget'
import { QuickLinksWidget } from './QuickLinksWidget'
import { CalendarWidget } from './CalendarWidget'
import { EmailWidget } from './EmailWidget'
import { SlackWidget } from './SlackWidget'

const COMPONENTS: Record<string, React.ComponentType> = {
  brief: DailyBriefCard,
  tasks: TasksWidget,
  weather: WeatherWidget,
  habits: HabitsWidget,
  notes: NotesWidget,
  focus: FocusTimerWidget,
  links: QuickLinksWidget,
  calendar: CalendarWidget,
  email: EmailWidget,
  slack: SlackWidget,
}

const META = new Map(WIDGETS.map((w) => [w.id, w]))

export function DashboardGrid({ initialLayout }: { initialLayout: WidgetLayoutItem[] }) {
  const [layout, setLayout] = useState(initialLayout)
  const [draft, setDraft] = useState(initialLayout)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function move(index: number, direction: -1 | 1) {
    setDraft((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function toggle(id: string) {
    setDraft((prev) => prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)))
  }

  async function save() {
    setSaving(true)
    setLayout(draft)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ dashboard_layout: draft }).eq('id', user.id)
    }
    setSaving(false)
    setOpen(false)
  }

  const visible = layout.filter((w) => w.enabled && COMPONENTS[w.id])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
          Your workspace
        </h2>
        <Dialog.Root
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (next) setDraft(layout)
          }}
        >
          <Dialog.Trigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Customize
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-brand-700/30 backdrop-blur-[2px] z-40" />
            <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-sm bg-surface-900 border-l border-surface-750 shadow-2xl z-50 flex flex-col focus:outline-none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800">
                <div>
                  <Dialog.Title className="text-base font-semibold text-surface-100">
                    Customize your page
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-surface-500 mt-0.5">
                    Choose what you see and the order it appears in.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="text-surface-500 hover:text-surface-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                {draft.map((item, index) => {
                  const meta = META.get(item.id)
                  if (!meta) return null
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                        item.enabled
                          ? 'border-surface-750 bg-surface-950'
                          : 'border-transparent bg-surface-800/60 opacity-70'
                      )}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-surface-600 shrink-0" />
                      <Checkbox.Root
                        checked={item.enabled}
                        onCheckedChange={() => toggle(item.id)}
                        className={cn(
                          'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
                          item.enabled
                            ? 'bg-brand-500 border-brand-500'
                            : 'border-surface-600 bg-surface-900'
                        )}
                      >
                        <Checkbox.Indicator>
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-100">{meta.title}</p>
                        <p className="text-xs text-surface-500 truncate">{meta.description}</p>
                      </div>
                      <div className="flex flex-col shrink-0">
                        <button
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          className="text-surface-500 hover:text-brand-400 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => move(index, 1)}
                          disabled={index === draft.length - 1}
                          className="text-surface-500 hover:text-brand-400 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-4 border-t border-surface-800 flex gap-2">
                <Dialog.Close asChild>
                  <Button variant="secondary" className="flex-1">Cancel</Button>
                </Dialog.Close>
                <Button className="flex-1" onClick={save} loading={saving}>
                  Save layout
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-min">
        {visible.map((item, index) => {
          const meta = META.get(item.id)
          const Component = COMPONENTS[item.id]
          return (
            <div
              key={item.id}
              className={cn(
                'animate-fade-up',
                meta?.span === 2 && 'md:col-span-2',
                meta?.span === 3 && 'md:col-span-2 xl:col-span-3'
              )}
              style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}
            >
              <Component />
            </div>
          )
        })}

        {visible.length === 0 && (
          <div className="col-span-full text-center py-16 text-surface-500 text-sm">
            Everything is hidden. Use <span className="font-medium text-surface-300">Customize</span> to
            add widgets back.
          </div>
        )}
      </div>
    </div>
  )
}
