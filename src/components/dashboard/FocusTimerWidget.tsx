'use client'

import { useEffect, useRef, useState } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

export function FocusTimerWidget() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS
  const progress = 1 - secondsLeft / total

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          setMode((m) => (m === 'focus' ? 'break' : 'focus'))
          return mode === 'focus' ? BREAK_SECONDS : FOCUS_SECONDS
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, mode])

  function reset() {
    setRunning(false)
    setSecondsLeft(mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS)
  }

  function switchMode(next: 'focus' | 'break') {
    setMode(next)
    setRunning(false)
    setSecondsLeft(next === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  // SVG ring
  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5" /> Focus
        </CardTitle>
        <div className="flex rounded-lg bg-surface-800 p-0.5">
          {(['focus', 'break'] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors',
                mode === m ? 'bg-surface-900 text-brand-500 shadow-sm' : 'text-surface-500'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-2">
        <div className="relative w-32 h-32 mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60" cy="60" r={radius} fill="none"
              className="stroke-surface-800" strokeWidth="7"
            />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              className={mode === 'focus' ? 'stroke-brand-500' : 'stroke-success'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums text-surface-100">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={reset}
            className="w-10 h-10 rounded-full bg-surface-800 hover:bg-surface-750 text-surface-400 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
