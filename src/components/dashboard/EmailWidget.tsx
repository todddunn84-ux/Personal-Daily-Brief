import Link from 'next/link'
import { Mail, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Phase 2: Replace with real Gmail/Outlook email data
export function EmailWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Connect prompt */}
        <div className="border border-dashed border-surface-700 rounded-xl p-6 text-center">
          <Mail className="w-8 h-8 text-surface-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-300 mb-1">
            Connect your email
          </p>
          <p className="text-xs text-surface-500 mb-4 max-w-[200px] mx-auto">
            See your important Gmail or Outlook messages here
          </p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            <Plus className="w-3 h-3" /> Connect email
          </Link>
        </div>

        {/* Preview */}
        <div className="mt-4 space-y-2 opacity-40 pointer-events-none select-none">
          <p className="text-xs text-surface-600 uppercase tracking-wider mb-2">Preview</p>
          {[
            { from: 'Sarah Chen', subject: 'Q2 planning doc is ready', time: '9:14 AM' },
            { from: 'GitHub', subject: 'PR review requested: feature/auth', time: '8:52 AM' },
            { from: 'Stripe', subject: 'Your weekly revenue report', time: '8:00 AM' },
          ].map((email) => (
            <div key={email.subject} className="rounded-lg bg-surface-800 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-semibold text-surface-200 truncate">{email.from}</p>
                <p className="text-xs text-surface-600 shrink-0">{email.time}</p>
              </div>
              <p className="text-xs text-surface-500 truncate">{email.subject}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
