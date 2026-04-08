'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, Plus, Trash2, Flag } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  completed: boolean
}

const priorityColors = {
  high: 'danger' as const,
  medium: 'warning' as const,
  low: 'secondary' as const,
}

export function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTasks(data)
    } catch {
      // silently fail — tasks will be empty
    } finally {
      setLoading(false)
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask.trim(), priority: 'medium' }),
      })
      if (!res.ok) throw new Error()
      const task = await res.json()
      setTasks((prev) => [task, ...prev])
      setNewTask('')
      setShowInput(false)
    } catch {
      // handle silently
    } finally {
      setAdding(false)
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    )
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
    } catch {
      // revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed } : t))
      )
    }
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    } catch {
      fetchTasks() // re-fetch if delete failed
    }
  }

  const pending = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5" /> Tasks
          {pending.length > 0 && (
            <span className="ml-1 text-xs bg-brand-500/20 text-brand-400 rounded-full px-1.5 py-0.5">
              {pending.length}
            </span>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInput(!showInput)}
          className="h-7 w-7"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add task input */}
        {showInput && (
          <form onSubmit={addTask} className="flex gap-2">
            <input
              autoFocus
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => e.key === 'Escape' && setShowInput(false)}
            />
            <Button size="sm" type="submit" loading={adding}>Add</Button>
          </form>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-8">
            <CheckSquare className="w-8 h-8 text-surface-700 mx-auto mb-2" />
            <p className="text-sm text-surface-500">No tasks yet</p>
            <button
              onClick={() => setShowInput(true)}
              className="text-xs text-brand-400 hover:text-brand-300 mt-1"
            >
              Add your first task →
            </button>
          </div>
        )}

        {/* Pending tasks */}
        <div className="space-y-1.5">
          {pending.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id, task.completed)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>

        {/* Completed tasks (collapsed) */}
        {done.length > 0 && (
          <details className="group">
            <summary className="text-xs text-surface-600 cursor-pointer hover:text-surface-400 list-none flex items-center gap-1 mt-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              {done.length} completed
            </summary>
            <div className="space-y-1.5 mt-2 opacity-50">
              {done.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id, task.completed)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-800 transition-colors">
      <button
        onClick={onToggle}
        className={cn(
          'w-4 h-4 rounded border transition-colors shrink-0 flex items-center justify-center',
          task.completed
            ? 'bg-brand-500 border-brand-500'
            : 'border-surface-600 hover:border-brand-500'
        )}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={cn(
        'flex-1 text-sm',
        task.completed ? 'line-through text-surface-600' : 'text-surface-200'
      )}>
        {task.title}
      </span>

      {!task.completed && task.priority !== 'medium' && (
        <Badge variant={priorityColors[task.priority]} className="text-xs px-1.5 py-0">
          <Flag className="w-2.5 h-2.5 mr-0.5" />
          {task.priority}
        </Badge>
      )}

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-surface-600 hover:text-danger transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
