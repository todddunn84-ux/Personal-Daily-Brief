'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface EmailSummary {
  id: string
  from: string
  subject: string
  date: string
}

function shortTime(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const today = new Date().toDateString() === d.toDateString()
  return today
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function EmailWidget() {
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/email')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setConnected(Boolean(data.connected))
        setEmails(data.emails ?? [])
      } catch {
        // treat as not connected
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Email
        </CardTitle>
        {connected && emails.length > 0 && (
          <span className="text-xs bg-brand-50 text-brand-400 rounded-full px-1.5 py-0.5">
            {emails.length} unread
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-11 w-full" />
          </div>
        )}

        {!loading && connected && emails.length === 0 && (
          <div className="text-center py-6">
            <Mail className="w-8 h-8 text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500">Inbox zero — nothing unread</p>
          </div>
        )}

        {!loading && connected && emails.length > 0 && (
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email.id} className="rounded-lg bg-surface-800 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-surface-200 truncate">{email.from}</p>
                  <p className="text-xs text-surface-600 shrink-0">{shortTime(email.date)}</p>
                </div>
                <p className="text-xs text-surface-500 truncate">{email.subject}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && !connected && (
          <div className="border border-dashed border-surface-700 rounded-xl p-6 text-center">
            <Mail className="w-8 h-8 text-surface-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-300 mb-1">
              Connect your email
            </p>
            <p className="text-xs text-surface-500 mb-4 max-w-[200px] mx-auto">
              See your important Gmail messages here
            </p>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-500 font-medium"
            >
              <Plus className="w-3 h-3" /> Connect email
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
