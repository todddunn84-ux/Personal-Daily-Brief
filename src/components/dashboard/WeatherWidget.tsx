'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Cloud, Wind, Droplets, Eye, MapPin, RefreshCw } from 'lucide-react'

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  visibility: number
  city: string
  high: number
  low: number
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchWeather(lat: number, lon: number) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!res.ok) throw new Error('Failed to fetch weather')
      const data = await res.json()
      setWeather(data)
    } catch {
      setError('Could not load weather')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Default to New York if location denied
        fetchWeather(40.7128, -74.006)
      }
    )
  }, [])

  const weatherEmoji = (desc: string) => {
    const d = desc.toLowerCase()
    if (d.includes('sun') || d.includes('clear')) return '☀️'
    if (d.includes('cloud') && d.includes('partly')) return '⛅'
    if (d.includes('cloud') || d.includes('overcast')) return '☁️'
    if (d.includes('rain') || d.includes('drizzle')) return '🌧️'
    if (d.includes('thunder') || d.includes('storm')) return '⛈️'
    if (d.includes('snow')) return '❄️'
    if (d.includes('fog') || d.includes('mist')) return '🌫️'
    return '🌤️'
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5" /> Weather
        </CardTitle>
        {weather && (
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather(40.7128, -74.006)
              )
            }}
            className="text-surface-500 hover:text-surface-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-sm text-surface-500 text-center py-4">{error}</div>
        )}

        {weather && !loading && (
          <div className="space-y-4">
            {/* Main temp */}
            <div className="flex items-center gap-4">
              <span className="text-5xl">{weatherEmoji(weather.description)}</span>
              <div>
                <p className="text-4xl font-bold text-surface-100">{Math.round(weather.temp)}°F</p>
                <p className="text-sm text-surface-400 capitalize">{weather.description}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <MapPin className="w-3 h-3" />
              {weather.city}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: Wind, label: 'Wind', value: `${Math.round(weather.windSpeed)} mph` },
                { icon: Eye, label: 'Visibility', value: `${Math.round(weather.visibility / 1000)} km` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-surface-800 rounded-lg p-2 text-center">
                  <Icon className="w-3.5 h-3.5 text-surface-500 mx-auto mb-1" />
                  <p className="text-xs text-surface-100 font-medium">{value}</p>
                  <p className="text-xs text-surface-600">{label}</p>
                </div>
              ))}
            </div>

            {/* High / Low */}
            <div className="text-xs text-surface-500">
              H:{Math.round(weather.high)}° · L:{Math.round(weather.low)}° · Feels like {Math.round(weather.feelsLike)}°
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
