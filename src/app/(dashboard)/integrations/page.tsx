import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Mail, MessageSquare, CheckCircle, Plug } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Integrations' }

const integrations = [
  {
    id: 'google',
    name: 'Google',
    description: 'Sync Google Calendar events and Gmail messages to your dashboard',
    services: ['Google Calendar', 'Gmail'],
    icon: Calendar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    comingSoon: true,
  },
  {
    id: 'microsoft',
    name: 'Microsoft Outlook',
    description: 'Connect Outlook Calendar and Outlook Email for your daily briefing',
    services: ['Outlook Calendar', 'Outlook Email'],
    icon: Mail,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    comingSoon: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'See your Slack messages and mentions without switching tabs',
    services: ['Direct Messages', 'Channel Mentions'],
    icon: MessageSquare,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    comingSoon: true,
  },
]

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: connectedIntegrations } = await supabase
    .from('integrations')
    .select('provider')
    .eq('user_id', user!.id)
    .eq('connected', true)

  const connectedSet = new Set(connectedIntegrations?.map((i) => i.provider) ?? [])

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-100 mb-2">Integrations</h2>
        <p className="text-surface-400">
          Connect your tools to power up your daily briefing dashboard.
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map(({ id, name, description, services, icon: Icon, color, bg, comingSoon }) => {
          const isConnected = connectedSet.has(id)
          return (
            <Card key={id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-surface-100">{name}</h3>
                      {isConnected && (
                        <span className="flex items-center gap-1 text-xs text-success bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                      )}
                      {comingSoon && (
                        <span className="text-xs text-surface-500 bg-surface-800 border border-surface-700 rounded-full px-2 py-0.5">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-400 mb-3">{description}</p>
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <span key={s} className="text-xs bg-surface-800 border border-surface-700 rounded-full px-2.5 py-1 text-surface-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isConnected ? (
                      <button className="text-sm text-surface-500 hover:text-danger border border-surface-700 rounded-lg px-4 py-2 hover:border-danger/50 transition-colors">
                        Disconnect
                      </button>
                    ) : comingSoon ? (
                      <button disabled className="text-sm text-surface-600 border border-surface-800 rounded-lg px-4 py-2 cursor-not-allowed">
                        Coming soon
                      </button>
                    ) : (
                      <button className="text-sm text-brand-400 border border-brand-500/40 rounded-lg px-4 py-2 hover:bg-brand-500/10 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Note about Phase 2 */}
      <div className="mt-8 p-4 bg-surface-900 border border-surface-800 rounded-xl">
        <div className="flex items-start gap-3">
          <Plug className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <p className="text-sm text-surface-400">
            <span className="text-surface-200 font-medium">OAuth coming in Phase 2.</span>{' '}
            Full Google, Outlook, and Slack integration with OAuth flows is being built next.
            Your dashboard widgets will automatically populate once connected.
          </p>
        </div>
      </div>
    </div>
  )
}
