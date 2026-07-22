import { getGreeting } from '@/lib/utils'
import { MobileNav } from './MobileNav'

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
    <header className="h-16 border-b border-surface-750 px-4 md:px-6 flex items-center justify-between gap-3 bg-surface-900/70 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <MobileNav />
        <div className="min-w-0">
          <h1 className="text-lg text-surface-100 leading-tight truncate">
            <span className="font-display italic">{greeting},</span>{' '}
            <span className="font-semibold">{firstName}</span>
          </h1>
          <p className="text-xs text-surface-500 truncate">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-surface-500 bg-surface-800 border border-surface-750 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          All systems ready
        </div>

        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-semibold text-accent-light">
          {firstName[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
