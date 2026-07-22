'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const NOTICES: Record<string, string> = {
  confirmed: 'Your email is confirmed — sign in below to continue.',
}

const ERRORS: Record<string, string> = {
  link_expired: 'That link has expired. Sign in with your password, or sign up again for a new one.',
  confirm_failed: "We couldn't confirm that link. Try signing in — if that fails, sign up again for a fresh link.",
  auth_callback_failed: "We couldn't complete sign-in from that link. Please sign in with your email and password.",
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const notice = NOTICES[searchParams.get('notice') ?? '']
  const linkError = ERRORS[searchParams.get('error') ?? '']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-light" />
          </div>
          <span className="text-xl font-bold text-surface-100">DayBrief</span>
        </div>

        {/* Card */}
        <div className="bg-surface-900 rounded-2xl border border-surface-800 p-8">
          <h1 className="text-xl font-semibold text-surface-100 mb-1">Welcome back</h1>
          <p className="text-sm text-surface-400 mb-6">Sign in to your account</p>

          {notice && (
            <p className="flex items-start gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2 mb-4">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              {notice}
            </p>
          )}

          {linkError && (
            <p className="text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mb-4">
              {linkError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-surface-300 mb-1.5" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-surface-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign up free
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-surface-600 mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="hover:text-surface-400">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-surface-400">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
