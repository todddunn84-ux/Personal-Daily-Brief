import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Phase 2: Replace with real Slack data
export function SlackWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Slack
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Connect prompt */}
        <div className="border border-dashed border-surface-700 rounded-xl p-6 text-center">
          <MessageSquare className="w-8 h-8 text-surface-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-300 mb-1">
            Connect Slack
          </p>
          <p className="text-xs text-surface-500 mb-4 max-w-[200px] mx-auto">
            See your Slack mentions and messages here without switching tabs
          </p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            <Plus className="w-3 h-3" /> Connect Slack
          </Link>
        </div>

        {/* Preview */}
        <div className="mt-4 space-y-2 opacity-40 pointer-events-none select-none">
          <p className="text-xs text-surface-600 uppercase tracking-wider mb-2">Preview</p>
          {[
            { channel: '#general', user: 'Alex', message: 'Hey, can you review the PR?', time: '10:23 AM' },
            { channel: '#design', user: 'Maria', message: 'New mockups are in Figma 🎨', time: '9:41 AM' },
            { channel: '#ops', user: 'DevOps Bot', message: 'Deploy to prod succeeded ✅', time: '9:00 AM' },
          ].map((msg) => (
            <div key={msg.message} className="rounded-lg bg-surface-800 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-semibold text-surface-200">
                  {msg.user}{' '}
                  <span className="text-surface-500 font-normal">{msg.channel}</span>
                </p>
                <p className="text-xs text-surface-600 shrink-0">{msg.time}</p>
              </div>
              <p className="text-xs text-surface-500 truncate">{msg.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
