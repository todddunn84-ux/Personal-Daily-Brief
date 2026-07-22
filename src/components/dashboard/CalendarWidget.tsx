'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatTime } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/calendar')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setConnected(Boolean(data.connected))
        setEvents(data.events ?? [])
      } catch {
        // treat as not connected
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Calendar
        </CardTitle>
        <span className="text-xs text-surface-600">{dayName}</span>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-11 w-full" />
          </div>
        )}

        {!loading && connected && events.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500">Nothing scheduled today</p>
          </div>
        )}

        {!loading && connected && events.length > 0 && (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-lg bg-surface-800 px-3 py-2"
              >
                <div className="w-1 h-8 bg-brand-400 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-200 truncate">{event.title}</p>
                  <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {event.allDay ? 'All day' : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !connected && (
          <div className="border border-dashed border-surface-700 rounded-xl p-6 text-center">
            <Calendar className="w-8 h-8 text-surface-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-300 mb-1">
              Connect your calendar
            </p>
            <p className="text-xs text-surface-500 mb-4 max-w-[200px] mx-auto">
              See your Google Calendar events right here
            </p>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-500 font-medium"
            >
              <Plus className="w-3 h-3" /> Connect calendar
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
