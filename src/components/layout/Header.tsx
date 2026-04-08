import { Bell } from 'lucide-react'
import { getGreeting } from '@/lib/utils'

interface HeaderProps {
  userName?: string | null
}

export function Header({ userName }: HeaderProps) {
  const greeting = getGreeting()
  const firstName = userName?.split(' ')[0] ?? 'there'

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="h-16 border-b border-surface-800 px-6 flex items-center justify-between bg-surface-950/50 backdrop-blur-sm shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-surface-100">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-xs text-surface-500">{dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-surface-200 hover:border-surface-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-semibold text-brand-400">
          {firstName[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
