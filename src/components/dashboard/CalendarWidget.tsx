import Link from 'next/link'
import { Calendar, Clock, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Phase 2: Replace with real Google/Outlook calendar data
export function CalendarWidget() {
  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Calendar
        </CardTitle>
        <span className="text-xs text-surface-600">{dayName}</span>
      </CardHeader>
      <CardContent>
        {/* Connect prompt */}
        <div className="border border-dashed border-surface-700 rounded-xl p-6 text-center">
          <Calendar className="w-8 h-8 text-surface-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-300 mb-1">
            Connect your calendar
          </p>
          <p className="text-xs text-surface-500 mb-4 max-w-[200px] mx-auto">
            See your Google Calendar or Outlook events right here
          </p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            <Plus className="w-3 h-3" /> Connect calendar
          </Link>
        </div>

        {/* Preview of what it'll look like */}
        <div className="mt-4 space-y-2 opacity-40 pointer-events-none select-none">
          <p className="text-xs text-surface-600 uppercase tracking-wider mb-2">Preview</p>
          {[
            { time: '9:00 AM', title: 'Team standup', duration: '30 min', color: 'bg-blue-500' },
            { time: '11:00 AM', title: 'Product review', duration: '1 hr', color: 'bg-purple-500' },
            { time: '2:00 PM', title: '1:1 with manager', duration: '30 min', color: 'bg-green-500' },
          ].map((event) => (
            <div key={event.title} className="flex items-center gap-3 rounded-lg bg-surface-800 px-3 py-2">
              <div className={`w-1 h-8 ${event.color} rounded-full shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-200 truncate">{event.title}</p>
                <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" /> {event.time} · {event.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
