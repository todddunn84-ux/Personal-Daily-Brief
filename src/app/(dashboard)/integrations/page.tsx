import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Mail, MessageSquare, CheckCircle, Plug, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DisconnectButton } from '@/components/integrations/DisconnectButton'
import { googleConfigured } from '@/lib/google'
import { tokenEncryptionAvailable } from '@/lib/crypto'

export const metadata: Metadata = { title: 'Integrations' }

const integrations = [
  {
    id: 'google',
    name: 'Google',
    description: 'Sync Google Calendar events and Gmail messages to your dashboard',
    services: ['Google Calendar', 'Gmail'],
    icon: Calendar,
    color: 'text-brand-400',
    bg: 'bg-brand-50',
    comingSoon: false,
  },
  {
    id: 'microsoft',
    name: 'Microsoft Outlook',
    description: 'Connect Outlook Calendar and Outlook Email for your daily briefing',
    services: ['Outlook Calendar', 'Outlook Email'],
    icon: Mail,
    color: 'text-accent',
    bg: 'bg-accent-50',
    comingSoon: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'See your Slack messages and mentions without switching tabs',
    services: ['Direct Messages', 'Channel Mentions'],
    icon: MessageSquare,
    color: 'text-accent',
    bg: 'bg-accent-50',
    comingSoon: true,
  },
]

const BANNERS: Record<string, { tone: 'success' | 'warning'; text: string }> = {
  'connected:google': { tone: 'success', text: 'Google connected — your calendar and email widgets are now live.' },
  'error:google_failed': { tone: 'warning', text: "Google connection didn't complete. Please try again." },
  'error:google_not_configured': {
    tone: 'warning',
    text: 'Google sign-in is not configured yet — an administrator needs to add the Google OAuth credentials.',
  },
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const params = await searchParams
  const bannerKey = params.connected
    ? `connected:${params.connected}`
    : params.error
      ? `error:${params.error}`
      : ''
  const banner = BANNERS[bannerKey]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: connectedIntegrations } = await supabase
    .from('integrations')
    .select('provider')
    .eq('user_id', user!.id)
    .eq('connected', true)

  const connectedSet = new Set(connectedIntegrations?.map((i) => i.provider) ?? [])
  const googleReady = googleConfigured() && tokenEncryptionAvailable()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-100 mb-2">Integrations</h2>
        <p className="text-surface-400">
          Connect your tools to power up your daily briefing dashboard.
        </p>
      </div>

      {banner && (
        <p
          className={
            banner.tone === 'success'
              ? 'flex items-start gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-3 mb-6'
              : 'flex items-start gap-2 text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-3 mb-6'
          }
        >
          {banner.tone === 'success' ? (
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          {banner.text}
        </p>
      )}

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
                      <DisconnectButton provider={id} />
                    ) : comingSoon ? (
                      <button disabled className="text-sm text-surface-600 border border-surface-800 rounded-lg px-4 py-2 cursor-not-allowed">
                        Coming soon
                      </button>
                    ) : googleReady ? (
                      <a
                        href={`/api/integrations/${id}/start`}
                        className="inline-block text-sm text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 transition-colors shadow-sm"
                      >
                        Connect
                      </a>
                    ) : (
                      <button
                        disabled
                        title="Awaiting Google OAuth credentials"
                        className="text-sm text-surface-600 border border-surface-800 rounded-lg px-4 py-2 cursor-not-allowed"
                      >
                        Not configured
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-surface-900 border border-surface-750 rounded-xl">
        <div className="flex items-start gap-3">
          <Plug className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <p className="text-sm text-surface-400">
            <span className="text-surface-200 font-medium">Read-only access.</span>{' '}
            DayBrief only ever requests read permissions — it can see your calendar and inbox to
            build your briefing, but can never send, edit, or delete anything. Disconnect anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
