'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X, Zap, LayoutDashboard, Plug, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/integrations', icon: Plug, label: 'Integrations' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Open menu"
          className="md:hidden w-10 h-10 -ml-1.5 rounded-lg flex items-center justify-center text-surface-400 hover:text-brand-500 hover:bg-surface-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-brand-700/40 backdrop-blur-[2px] z-40 md:hidden" />
        <Dialog.Content className="fixed left-0 top-0 h-full w-64 bg-linear-to-b from-brand-500 to-brand-700 z-50 flex flex-col focus:outline-none md:hidden">
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
          <div className="h-16 flex items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-light" />
              </div>
              <span className="font-bold text-white">DayBrief</span>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex-1 p-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Workspace
            </p>
            <div className="space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-white/15 text-white'
                        : 'text-white/65 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent-light" />
                    )}
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
