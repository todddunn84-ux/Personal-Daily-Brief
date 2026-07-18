'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface BriefResponse {
  content: string | null
  needsKey?: boolean
  error?: string
}

export function DailyBriefCard() {
  const [brief, setBrief] = useState<string | null>(null)
  const [needsKey, setNeedsKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function fetchBrief(refresh = false) {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/brief', { method: refresh ? 'POST' : 'GET' })
      const data: BriefResponse = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not load your brief.')
        return
      }
      setNeedsKey(Boolean(data.needsKey))
      setBrief(data.content)
    } catch {
      setError('Could not load your brief.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBrief()
  }, [])

  return (
    <Card className="h-full relative overflow-hidden">
      {/* Gold-to-navy briefing accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent-light via-accent to-brand-500" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-accent-light" />
            </div>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
              Your Daily Brief
            </h3>
          </div>
          {brief && (
            <button
              onClick={() => fetchBrief(true)}
              disabled={refreshing}
              title="Regenerate brief"
              className="text-surface-500 hover:text-brand-400 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {loading && (
          <div className="space-y-2.5">
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-5 w-11/12" />
            <div className="skeleton h-5 w-3/4" />
          </div>
        )}

        {!loading && brief && (
          <p className="font-display text-xl leading-relaxed text-surface-200">
            {brief}
          </p>
        )}

        {!loading && needsKey && (
          <p className="text-sm text-surface-500">
            AI briefings are almost ready — an administrator needs to add an Anthropic API key to
            enable them.
          </p>
        )}

        {!loading && !brief && !needsKey && error && (
          <p className="text-sm text-surface-500">{error}</p>
        )}
      </div>
    </Card>
  )
}
