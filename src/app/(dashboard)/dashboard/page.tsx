import type { Metadata } from 'next'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { TasksWidget } from '@/components/dashboard/TasksWidget'
import { CalendarWidget } from '@/components/dashboard/CalendarWidget'
import { EmailWidget } from '@/components/dashboard/EmailWidget'
import { SlackWidget } from '@/components/dashboard/SlackWidget'
import { AiChatPanel } from '@/components/dashboard/AiChatPanel'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Main grid */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-min">
        <WeatherWidget />
        <TasksWidget />
        <CalendarWidget />
        <EmailWidget />
        <SlackWidget />
      </div>

      {/* AI chat panel */}
      <div className="w-80 shrink-0 hidden lg:block">
        <AiChatPanel />
      </div>
    </div>
  )
}
