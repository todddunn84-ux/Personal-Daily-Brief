import Link from 'next/link'
import {
  Zap, Calendar, Mail, CheckSquare, MessageSquare,
  Cloud, ArrowRight, Star, Users, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* Nav */}
      <nav className="border-b border-surface-800/50 backdrop-blur-sm sticky top-0 z-50 bg-surface-950/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-surface-100">DayBrief</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm text-brand-400 mb-8">
          <Star className="w-3.5 h-3.5" />
          Your AI-powered daily command center
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-surface-100 leading-tight mb-6">
          Start every day
          <br />
          <span className="font-display italic font-medium text-transparent bg-clip-text bg-linear-to-r from-brand-400 via-brand-500 to-accent">
            knowing what matters
          </span>
        </h1>

        <p className="text-xl text-surface-400 max-w-2xl mx-auto mb-10">
          DayBrief connects your Google Calendar, Outlook, Slack, and email into
          one beautiful daily briefing — with an AI assistant that helps you act on it.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get started free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </Link>
        </div>

        <p className="text-sm text-surface-600 mt-4">Free plan available · No credit card required</p>

        {/* Dashboard preview */}
        <div className="mt-16 relative">
          <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
              {/* Weather preview */}
              <div className="col-span-1 bg-surface-800 rounded-xl p-4">
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Weather</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⛅</span>
                  <div>
                    <p className="text-2xl font-bold">72°F</p>
                    <p className="text-sm text-surface-400">Partly cloudy</p>
                  </div>
                </div>
              </div>

              {/* Tasks preview */}
              <div className="col-span-1 bg-surface-800 rounded-xl p-4">
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Tasks</p>
                <div className="space-y-2">
                  {['Q2 planning doc', 'Review PRs', 'Team standup'].map((t, i) => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <div className={`w-3.5 h-3.5 rounded border ${i === 0 ? 'bg-brand-500 border-brand-500' : 'border-surface-600'}`} />
                      <span className={i === 0 ? 'line-through text-surface-500' : 'text-surface-300'}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar preview */}
              <div className="col-span-2 md:col-span-1 bg-surface-800 rounded-xl p-4">
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Today</p>
                <div className="space-y-2">
                  {[
                    { time: '9:00 AM', title: 'Team standup' },
                    { time: '11:00 AM', title: 'Product review' },
                    { time: '2:00 PM', title: '1:1 with Sarah' },
                  ].map((e) => (
                    <div key={e.title} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-surface-500 w-16 shrink-0">{e.time}</span>
                      <span className="text-surface-300 truncate">{e.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI chat preview */}
            <div className="mt-4 bg-surface-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-surface-750 rounded-lg px-3 py-2 text-sm text-surface-300 max-w-md">
                  You have 3 meetings today. Your busiest slot is 9–11 AM. I&apos;d suggest blocking 3–5 PM for deep work — you have nothing scheduled then.
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-surface-950 to-transparent rounded-b-2xl" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-100 mb-4">
            Everything in one place
          </h2>
          <p className="text-surface-400 max-w-xl mx-auto">
            Stop switching between apps. DayBrief pulls everything that matters into a single, intelligent view.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              title: 'Smart Calendar',
              desc: "See today's events from Google Calendar and Outlook. Spot conflicts before they happen.",
              color: 'text-brand-400',
              bg: 'bg-brand-50',
            },
            {
              icon: Mail,
              title: 'Email Digest',
              desc: "Your most important unread emails — summarized and surfaced, not buried in a cluttered inbox.",
              color: 'text-accent',
              bg: 'bg-accent-50',
            },
            {
              icon: CheckSquare,
              title: 'Task Manager',
              desc: "Keep your to-do list where you can see it. Set priorities, due dates, and never drop the ball.",
              color: 'text-success',
              bg: 'bg-success/10',
            },
            {
              icon: Cloud,
              title: 'Weather Briefing',
              desc: 'Know what to wear and what to plan around before you step out the door.',
              color: 'text-brand-400',
              bg: 'bg-brand-50',
            },
            {
              icon: MessageSquare,
              title: 'Slack Snapshot',
              desc: "See your recent Slack mentions and messages without getting sucked into the feed.",
              color: 'text-accent',
              bg: 'bg-accent-50',
            },
            {
              icon: Zap,
              title: 'AI Assistant',
              desc: "Ask your AI anything about your day. Get proactive suggestions. Take action without switching apps.",
              color: 'text-brand-500',
              bg: 'bg-brand-100',
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-surface-900 border border-surface-800 rounded-xl p-6 hover:border-surface-700 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-surface-100 mb-2">{title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-surface-800">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-surface-100 mb-3">Works with your tools</h2>
          <p className="text-surface-400">Connect once, then forget about it.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {['Google Calendar', 'Gmail', 'Outlook', 'Slack', 'Microsoft Teams'].map((tool) => (
            <div
              key={tool}
              className="bg-surface-900 border border-surface-800 rounded-xl px-5 py-3 text-sm text-surface-400"
            >
              {tool}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-100 mb-4">Simple pricing</h2>
          <p className="text-surface-400">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-surface-100 mb-1">Free</h3>
            <p className="text-4xl font-bold text-surface-100 mb-1">$0</p>
            <p className="text-sm text-surface-500 mb-6">Forever free</p>
            <Link href="/signup">
              <Button variant="secondary" className="w-full mb-6">Get started free</Button>
            </Link>
            <ul className="space-y-3 text-sm text-surface-400">
              {['Daily briefing dashboard', 'Tasks & reminders', 'Weather widget', '1 calendar integration'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-brand-500/5 border border-brand-500/40 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            <h3 className="text-lg font-semibold text-surface-100 mb-1">Pro</h3>
            <p className="text-4xl font-bold text-surface-100 mb-1">$9.99</p>
            <p className="text-sm text-surface-500 mb-6">per month</p>
            <Link href="/signup">
              <Button className="w-full mb-6">Start free trial</Button>
            </Link>
            <ul className="space-y-3 text-sm text-surface-400">
              {[
                'Everything in Free',
                'All integrations (Google, Outlook, Slack)',
                'AI chat assistant',
                'Email digest & summaries',
                'Slack snapshot',
                'Priority support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-surface-800">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Users, value: '10+', label: 'Customizable widgets' },
            { icon: Star, value: 'AI-powered', label: 'Daily briefings' },
            { icon: Shield, value: 'Row-level', label: 'Data security' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-brand-400" />
              <p className="text-3xl font-bold text-surface-100">{value}</p>
              <p className="text-sm text-surface-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-500 via-brand-600 to-brand-700 px-8 py-16 text-center shadow-xl">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(600px 300px at 85% -30%, rgba(232, 212, 139, 0.2), transparent 65%)',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to take control of{' '}
              <span className="font-display italic font-medium text-accent-light">your day?</span>
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Join the professionals who start every morning with a clear, intelligent briefing.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-white text-brand-500 hover:bg-brand-50 active:bg-brand-100 shadow-md"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-700 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10 border border-white/15 flex items-center justify-center">
              <Zap className="w-3 h-3 text-accent-light" />
            </div>
            <span className="text-sm font-semibold text-white">DayBrief</span>
          </div>
          <p className="text-xs text-white/50">© 2026 DayBrief. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-white/60">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
