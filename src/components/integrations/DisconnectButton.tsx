'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DisconnectButton({ provider }: { provider: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function disconnect() {
    setBusy(true)
    try {
      await fetch(`/api/integrations/${provider}/disconnect`, { method: 'POST' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={disconnect}
      disabled={busy}
      className="text-sm text-surface-500 hover:text-danger border border-surface-700 rounded-lg px-4 py-2 hover:border-danger/50 transition-colors cursor-pointer disabled:opacity-50"
    >
      {busy ? 'Disconnecting…' : 'Disconnect'}
    </button>
  )
}
