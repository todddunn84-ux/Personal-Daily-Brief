'use client'

import { useEffect, useRef, useState } from 'react'
import { StickyNote, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export function NotesWidget() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data } = await supabase
        .from('notes')
        .select('content')
        .eq('user_id', user.id)
        .maybeSingle()

      setContent(data?.content ?? '')
      setLoading(false)
    }
    load()

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function handleChange(value: string) {
    setContent(value)
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('notes')
        .upsert({ user_id: user.id, content: value, updated_at: new Date().toISOString() })
      setSaved(true)
    }, 800)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" /> Scratchpad
        </CardTitle>
        <span className="text-xs text-surface-500 flex items-center gap-1">
          {saved ? (
            <>
              <Check className="w-3 h-3 text-success" /> Saved
            </>
          ) : (
            'Saving…'
          )}
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex">
        {loading ? (
          <div className="skeleton h-28 w-full" />
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={5000}
            placeholder="Jot something down — it saves automatically."
            className="w-full min-h-28 flex-1 resize-none bg-transparent text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none leading-relaxed"
          />
        )}
      </CardContent>
    </Card>
  )
}
