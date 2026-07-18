import type { Metadata } from 'next'
import { Geist, Newsreader } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
})

export const metadata: Metadata = {
  title: {
    default: 'DayBrief — Your AI Personal Assistant',
    template: '%s | DayBrief',
  },
  description:
    'Start every day knowing exactly what matters. DayBrief connects your calendar, email, and tasks into one intelligent daily briefing — with an AI assistant that helps you act on it.',
  keywords: ['personal assistant', 'daily briefing', 'AI assistant', 'calendar', 'productivity'],
  openGraph: {
    title: 'DayBrief — Your AI Personal Assistant',
    description: 'Start every day knowing exactly what matters.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  )
}
