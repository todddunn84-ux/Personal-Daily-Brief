'use client'

import { useEffect, useState } from 'react'
import { Settings, User, Bell, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? '')

      const { data } = await supabase
        .from('profiles')
        .select('full_name, location, timezone')
        .eq('id', user.id)
        .single()

      if (data) {
        setFullName(data.full_name ?? '')
        setLocation(data.location ?? '')
        setTimezone(data.timezone ?? 'America/New_York')
      }
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('profiles')
        .update({ full_name: fullName, location, timezone })
        .eq('id', user.id)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-100 mb-2">Settings</h2>
        <p className="text-surface-400">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-surface-300 mb-1.5">Email</label>
              <Input value={userEmail} disabled className="opacity-60" />
              <p className="text-xs text-surface-600 mt-1">Email cannot be changed here</p>
            </div>
            <div>
              <label className="block text-sm text-surface-300 mb-1.5">Full name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 inline mr-1" />
                Location (for weather)
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, NY"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-300 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 rounded-lg border border-surface-700 bg-surface-800 px-3 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Central Europe (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>

            <Button type="submit" loading={saving}>
              {saved ? '✓ Saved!' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Daily briefing email', desc: 'Receive your briefing by email every morning' },
              { label: 'Task reminders', desc: 'Get notified about upcoming task due dates' },
              { label: 'Calendar alerts', desc: 'Alerts before meetings start' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-surface-200">{label}</p>
                  <p className="text-xs text-surface-500">{desc}</p>
                </div>
                <div className="shrink-0">
                  <button className="w-10 h-5 bg-surface-700 rounded-full relative transition-colors">
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-surface-400 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
            <p className="text-xs text-surface-600 pt-2">Notification preferences coming in Phase 4</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-surface-200">Free plan</p>
              <p className="text-xs text-surface-500 mt-0.5">Upgrade for all integrations + AI chat</p>
            </div>
            <Button variant="secondary" size="sm" disabled title="Billing coming soon">
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
