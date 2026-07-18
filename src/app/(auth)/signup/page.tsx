'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // With email confirmation enabled, signUp returns no session — the user
    // must click the link in their inbox before they can sign in.
    if (!data.session) {
      setConfirmationSent(true)
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
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-surface-100">DayBrief</span>
        </div>

        {/* Card */}
        {confirmationSent ? (
          <div className="bg-surface-900 rounded-2xl border border-surface-800 p-8 text-center">
            <h1 className="text-xl font-semibold text-surface-100 mb-2">Check your email</h1>
            <p className="text-sm text-surface-400">
              We sent a confirmation link to{' '}
              <span className="text-surface-200 font-medium">{email}</span>. Click it to activate
              your account, then sign in.
            </p>
            <div className="mt-6 text-center text-sm text-surface-500">
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Go to sign in
              </Link>
            </div>
          </div>
        ) : (
        <div className="bg-surface-900 rounded-2xl border border-surface-800 p-8">
          <h1 className="text-xl font-semibold text-surface-100 mb-1">Get started free</h1>
          <p className="text-sm text-surface-400 mb-6">Create your account in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-surface-300 mb-1.5" htmlFor="name">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
        )}

        <p className="text-center text-xs text-surface-600 mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:text-surface-400">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-surface-400">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
