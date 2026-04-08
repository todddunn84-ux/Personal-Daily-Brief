'use client'

import { useState, useRef, useEffect } from 'react'
import { Zap, Send, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  "What's on my schedule today?",
  "What should I focus on first?",
  "Do I have any email follow-ups?",
  "Show me my high-priority tasks",
]

export function AiChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hi! I'm your DayBrief assistant. I can help you understand your day, prioritize your tasks, and take action on what's on your dashboard. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) throw new Error()
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-ai', role: 'assistant', content: data.reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-err',
          role: 'assistant',
          content: 'I need to be set up with an API key to chat. Add ANTHROPIC_API_KEY to your .env file to enable AI responses.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full max-h-[calc(100vh-7rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-surface-800 shrink-0">
        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-100">AI Assistant</p>
          <p className="text-xs text-surface-500">Powered by Claude</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-success" title="Ready" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-brand-400" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-surface-800 text-surface-200 rounded-tl-sm'
                  : 'bg-brand-500 text-white rounded-tr-sm'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-brand-400" />
            </div>
            <div className="bg-surface-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-surface-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-surface-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-surface-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs bg-surface-800 border border-surface-700 rounded-full px-3 py-1.5 text-surface-400 hover:border-brand-500/50 hover:text-surface-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-surface-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your day..."
            className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-3.5 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            className="h-9 w-9 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
