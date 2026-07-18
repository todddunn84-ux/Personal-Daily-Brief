'use client'

import { useEffect, useState } from 'react'
import { Link2, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface QuickLink {
  id: string
  title: string
  url: string
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.toString()
  } catch {
    return null
  }
}

export function QuickLinksWidget() {
  const [links, setLinks] = useState<QuickLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [inputError, setInputError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data } = await supabase
        .from('quick_links')
        .select('id, title, url')
        .eq('user_id', user.id)
        .order('created_at')

      setLinks(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function addLink(e: React.FormEvent) {
    e.preventDefault()
    const cleanUrl = normalizeUrl(url)
    if (!cleanUrl || !title.trim()) {
      setInputError('Enter a name and a valid URL')
      return
    }
    setInputError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('quick_links')
      .insert({ user_id: user.id, title: title.trim(), url: cleanUrl })
      .select('id, title, url')
      .single()

    if (data) {
      setLinks((prev) => [...prev, data])
      setTitle('')
      setUrl('')
      setShowInput(false)
    }
  }

  async function deleteLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    const supabase = createClient()
    await supabase.from('quick_links').delete().eq('id', id)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" /> Quick Links
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowInput(!showInput)} className="h-7 w-7">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showInput && (
          <form onSubmit={addLink} className="space-y-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Name (e.g. Team wiki)"
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                maxLength={500}
                placeholder="URL"
                className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Button size="sm" type="submit">Add</Button>
            </div>
            {inputError && <p className="text-xs text-danger">{inputError}</p>}
          </form>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="skeleton h-9 w-full" />
            <div className="skeleton h-9 w-full" />
          </div>
        )}

        {!loading && links.length === 0 && !showInput && (
          <div className="text-center py-6">
            <Link2 className="w-8 h-8 text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500">Pin your go-to tools</p>
            <button
              onClick={() => setShowInput(true)}
              className="text-xs text-brand-400 hover:text-brand-500 mt-1 font-medium"
            >
              Add your first link →
            </button>
          </div>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-surface-200 hover:text-brand-400 truncate transition-colors"
            >
              {link.title}
            </a>
            <button
              onClick={() => deleteLink(link.id)}
              className="opacity-0 group-hover:opacity-100 text-surface-600 hover:text-danger transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
