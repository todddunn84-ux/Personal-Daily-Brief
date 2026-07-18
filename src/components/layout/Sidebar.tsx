'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap, LayoutDashboard, Plug, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/integrations', icon: Plug, label: 'Integrations' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-linear-to-b from-brand-500 to-brand-700 transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-accent-light" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white truncate">DayBrief</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Workspace
          </p>
        )}
        <div className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent-light" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-900 border border-surface-700 shadow-sm flex items-center justify-center text-surface-500 hover:text-brand-500 transition-colors z-10 cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  )
}
