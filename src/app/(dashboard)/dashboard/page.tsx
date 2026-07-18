import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StatsRow } from '@/components/dashboard/StatsRow'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { AiChatPanel } from '@/components/dashboard/AiChatPanel'
import { normalizeLayout } from '@/lib/widgets'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('timezone, dashboard_layout')
        .eq('id', user.id)
        .single()
    : { data: null }

  const layout = normalizeLayout(profile?.dashboard_layout)
  const timezone = profile?.timezone ?? 'America/New_York'

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Main column */}
      <div className="flex-1 min-w-0 space-y-6">
        {user && <StatsRow userId={user.id} timezone={timezone} />}
        <DashboardGrid initialLayout={layout} />
      </div>

      {/* AI chat panel */}
      <div className="w-80 shrink-0 hidden lg:block">
        <AiChatPanel />
      </div>
    </div>
  )
}
