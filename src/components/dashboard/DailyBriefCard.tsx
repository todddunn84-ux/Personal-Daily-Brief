'use client'

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'

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
    <div className="h-full relative overflow-hidden rounded-xl bg-linear-to-br from-brand-500 via-brand-600 to-brand-700 shadow-md">
      {/* Gold atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(420px 220px at 92% -20%, rgba(232, 212, 139, 0.22), transparent 65%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-accent-light/80 to-transparent" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-light" />
            <h3 className="text-xs font-semibold text-accent-light uppercase tracking-[0.14em]">
              Your Daily Brief
            </h3>
          </div>
          {brief && (
            <button
              onClick={() => fetchBrief(true)}
              disabled={refreshing}
              title="Regenerate brief"
              aria-label="Regenerate brief"
              className="text-white/50 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {loading && (
          <div className="space-y-2.5">
            <div className="h-5 w-full rounded-md bg-white/10 animate-pulse" />
            <div className="h-5 w-11/12 rounded-md bg-white/10 animate-pulse" />
            <div className="h-5 w-3/4 rounded-md bg-white/10 animate-pulse" />
          </div>
        )}

        {!loading && brief && (
          <p className="font-display text-xl leading-relaxed text-white">
            {brief}
          </p>
        )}

        {!loading && needsKey && (
          <p className="font-display text-lg leading-relaxed text-white/80 italic">
            Your AI briefing will appear here each morning — a calm, two-minute read on what
            deserves your attention today.
          </p>
        )}

        {!loading && !brief && !needsKey && error && (
          <p className="text-sm text-white/70">{error}</p>
        )}
      </div>
    </div>
  )
}
