import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function parseCoord(value: string | null, fallback: number, min: number, max: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const lat = parseCoord(searchParams.get('lat'), 40.7128, -90, 90)
  const lon = parseCoord(searchParams.get('lon'), -74.006, -180, 180)

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key not configured' }, { status: 503 })
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`,
        { next: { revalidate: 1800 } } // cache for 30 min
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=8`,
        { next: { revalidate: 1800 } }
      ),
    ])

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error('OpenWeatherMap request failed')
    }

    const current = await currentRes.json()
    const forecast = await forecastRes.json()

    // Calculate today's high/low from forecast
    const todayTemps = forecast.list.map((f: { main: { temp: number } }) => f.main.temp)
    const high = Math.max(...todayTemps, current.main.temp_max)
    const low = Math.min(...todayTemps, current.main.temp_min)

    return NextResponse.json({
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      visibility: current.visibility,
      city: current.name,
      high,
      low,
    })
  } catch (err) {
    console.error('Weather API error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }
}
