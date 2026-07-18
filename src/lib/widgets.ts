export interface WidgetLayoutItem {
  id: string
  enabled: boolean
}

export interface WidgetMeta {
  id: string
  title: string
  description: string
  /** Grid columns spanned on xl screens (grid is 3 columns) */
  span: 1 | 2 | 3
}

export const WIDGETS: WidgetMeta[] = [
  { id: 'brief', title: 'Daily Brief', description: 'AI-written summary of your day', span: 2 },
  { id: 'tasks', title: 'Tasks', description: 'To-dos with priorities and due dates', span: 1 },
  { id: 'weather', title: 'Weather', description: 'Local conditions and forecast', span: 1 },
  { id: 'habits', title: 'Habits', description: 'Daily habit tracker with streaks', span: 1 },
  { id: 'notes', title: 'Scratchpad', description: 'Quick notes that autosave', span: 1 },
  { id: 'focus', title: 'Focus Timer', description: 'Pomodoro-style deep work timer', span: 1 },
  { id: 'links', title: 'Quick Links', description: 'Your most-used destinations', span: 1 },
  { id: 'calendar', title: 'Calendar', description: 'Today’s events (connect Google/Outlook)', span: 1 },
  { id: 'email', title: 'Email', description: 'Important messages (connect Gmail/Outlook)', span: 1 },
  { id: 'slack', title: 'Slack', description: 'Mentions and DMs (connect Slack)', span: 1 },
]

export const DEFAULT_LAYOUT: WidgetLayoutItem[] = [
  { id: 'brief', enabled: true },
  { id: 'tasks', enabled: true },
  { id: 'weather', enabled: true },
  { id: 'habits', enabled: true },
  { id: 'notes', enabled: true },
  { id: 'calendar', enabled: true },
  { id: 'focus', enabled: false },
  { id: 'links', enabled: false },
  { id: 'email', enabled: false },
  { id: 'slack', enabled: false },
]

/** Merge a stored layout with the registry: drop unknown ids, append new widgets. */
export function normalizeLayout(stored: unknown): WidgetLayoutItem[] {
  const known = new Map(WIDGETS.map((w) => [w.id, w]))
  const result: WidgetLayoutItem[] = []
  const seen = new Set<string>()

  if (Array.isArray(stored)) {
    for (const item of stored) {
      if (
        item && typeof item === 'object' &&
        typeof (item as WidgetLayoutItem).id === 'string' &&
        known.has((item as WidgetLayoutItem).id) &&
        !seen.has((item as WidgetLayoutItem).id)
      ) {
        result.push({
          id: (item as WidgetLayoutItem).id,
          enabled: Boolean((item as WidgetLayoutItem).enabled),
        })
        seen.add((item as WidgetLayoutItem).id)
      }
    }
  }

  for (const def of DEFAULT_LAYOUT) {
    if (!seen.has(def.id)) result.push({ ...def })
  }

  return result
}
