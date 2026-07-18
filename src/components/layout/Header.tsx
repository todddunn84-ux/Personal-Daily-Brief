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
    <header className="h-16 border-b border-surface-750 px-6 flex items-center justify-between bg-surface-900/70 backdrop-blur-sm shrink-0">
      <div>
        <h1 className="text-lg text-surface-100 leading-tight">
          <span className="font-display italic">{greeting},</span>{' '}
          <span className="font-semibold">{firstName}</span>
        </h1>
        <p className="text-xs text-surface-500">{dateStr}</p>
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
