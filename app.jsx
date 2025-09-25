import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Wind, 
  Droplets, 
  Eye, 
  Sunrise, 
  Sunset,
  MapPin,
  Search,
  Moon,
  Thermometer,
  Gauge,
  AlertTriangle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import './App.css'

const API_KEY = '8b5e7fb555ec03d763d54c1bd6307c0d'

function App() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [city, setCity] = useState('London')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMetric, setIsMetric] = useState(true)

  const getWeatherIcon = (weatherCode, isDay = true) => {
    const iconMap = {
      '01d': <Sun className="w-8 h-8 text-yellow-500 animate-spin-slow" />,
      '01n': <Moon className="w-8 h-8 text-blue-300" />,
      '02d': <Cloud className="w-8 h-8 text-gray-400" />,
      '02n': <Cloud className="w-8 h-8 text-gray-600" />,
      '03d': <Cloud className="w-8 h-8 text-gray-500" />,
      '03n': <Cloud className="w-8 h-8 text-gray-700" />,
      '04d': <Cloud className="w-8 h-8 text-gray-600" />,
      '04n': <Cloud className="w-8 h-8 text-gray-800" />,
      '09d': <CloudRain className="w-8 h-8 text-blue-500 animate-bounce" />,
      '09n': <CloudRain className="w-8 h-8 text-blue-600 animate-bounce" />,
      '10d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '10n': <CloudRain className="w-8 h-8 text-blue-600" />,
      '11d': <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />,
      '11n': <Zap className="w-8 h-8 text-yellow-300 animate-pulse" />,
      '13d': <CloudSnow className="w-8 h-8 text-blue-200 animate-pulse" />,
      '13n': <CloudSnow className="w-8 h-8 text-blue-100 animate-pulse" />,
      '50d': <Cloud className="w-8 h-8 text-gray-400 opacity-70" />,
      '50n': <Cloud className="w-8 h-8 text-gray-600 opacity-70" />
    }
    return iconMap[weatherCode] || <Sun className="w-8 h-8 text-yellow-500" />
  }

  const getBackgroundGradient = (weatherCode, temp) => {
    if (!weatherCode) return 'from-blue-400 to-blue-600'
    
    const code = weatherCode.substring(0, 2)
    const isNight = weatherCode.includes('n')
    
    if (isNight) {
      return 'from-indigo-900 via-purple-900 to-black'
    }
    
    switch (code) {
      case '01': // clear sky
        return temp > 25 ? 'from-orange-400 to-red-500' : 'from-blue-400 to-blue-600'
      case '02':
      case '03':
      case '04': // clouds
        return 'from-gray-400 to-gray-600'
      case '09':
      case '10': // rain
        return 'from-gray-600 to-blue-800'
      case '11': // thunderstorm
        return 'from-gray-800 to-purple-900'
      case '13': // snow
        return 'from-blue-200 to-blue-400'
      case '50': // mist
        return 'from-gray-300 to-gray-500'
      default:
        return 'from-blue-400 to-blue-600'
    }
  }

  const fetchWeatherData = async (cityName) => {
    setLoading(true)
    try {
      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${isMetric ? 'metric' : 'imperial'}`
      )
      const currentData = await currentResponse.json()
      
      if (currentResponse.ok) {
        setCurrentWeather(currentData)
        
        // 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${isMetric ? 'metric' : 'imperial'}`
        )
        const forecastData = await forecastResponse.json()
        
        if (forecastResponse.ok) {
          setForecast(forecastData)
          
          // Process hourly data for charts
          const hourlyProcessed = forecastData.list.slice(0, 24).map((item, index) => ({
            time: new Date(item.dt * 1000).getHours() + ':00',
            temperature: Math.round(item.main.temp),
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            precipitation: item.rain ? item.rain['3h'] || 0 : 0
          }))
          setHourlyData(hourlyProcessed)
        }
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setCity(searchInput.trim())
      fetchWeatherData(searchInput.trim())
      setSearchInput('')
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${isMetric ? 'metric' : 'imperial'}`
          )
          const data = await response.json()
          if (response.ok) {
            setCity(data.name)
            setCurrentWeather(data)
            fetchWeatherData(data.name)
          }
        } catch (error) {
          console.error('Error fetching location weather:', error)
        }
      })
    }
  }

  useEffect(() => {
    fetchWeatherData(city)
  }, [isMetric])

  useEffect(() => {
    // Initial load
    fetchWeatherData(city)
  }, [])

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDailyForecast = () => {
    if (!forecast) return []
    
    const dailyData = {}
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyData[date]) {
        dailyData[date] = {
          date: new Date(item.dt * 1000),
          temps: [],
          weather: item.weather[0],
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        }
      }
      dailyData[date].temps.push(item.main.temp)
    })
    
    return Object.values(dailyData).slice(0, 7).map(day => ({
      ...day,
      minTemp: Math.round(Math.min(...day.temps)),
      maxTemp: Math.round(Math.max(...day.temps))
    }))
  }

  const getAirQualityColor = (aqi) => {
    if (aqi <= 50) return 'text-green-500'
    if (aqi <= 100) return 'text-yellow-500'
    if (aqi <= 150) return 'text-orange-500'
    return 'text-red-500'
  }

  const backgroundGradient = currentWeather 
    ? getBackgroundGradient(currentWeather.weather[0].icon, currentWeather.main.temp)
    : 'from-blue-400 to-blue-600'

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className={`fixed inset-0 bg-gradient-to-br ${backgroundGradient} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">WeatherVibe</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMetric(!isMetric)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {isMetric ? '°C' : '°F'}
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70 pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            </div>
            <Button
              type="button"
              onClick={getCurrentLocation}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              variant="outline"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </form>
        </header>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        )}

        {currentWeather && !loading && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                {getWeatherIcon(currentWeather.weather[0].icon)}
              </div>
              <h2 className="text-6xl md:text-8xl font-bold text-white mb-2 animate-pulse">
                {Math.round(currentWeather.main.temp)}°{isMetric ? 'C' : 'F'}
              </h2>
              <p className="text-xl text-white/90 mb-2">{currentWeather.weather[0].description}</p>
              <p className="text-lg text-white/80 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                {currentWeather.name}, {currentWeather.sys.country}
              </p>
            </div>

            {/* Weather Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 text-center">
                  <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-300" />
                  <p className="text-sm opacity-80">Humidity</p>
                  <p className="text-xl font-bold">{currentWeather.main.humidity}%</p>
                  <Progress value={currentWeather.main.humidity} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 text-center">
                  <Wind className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm opacity-80">Wind Speed</p>
                  <p className="text-xl font-bold">{currentWeather.wind.speed} {isMetric ? 'm/s' : 'mph'}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-purple-300" />
                  <p className="text-sm opacity-80">Visibility</p>
                  <p className="text-xl font-bold">{(currentWeather.visibility / 1000).toFixed(1)} km</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-4 text-center">
                  <Gauge className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
                  <p className="text-sm opacity-80">Pressure</p>
                  <p className="text-xl font-bold">{currentWeather.main.pressure} hPa</p>
                </CardContent>
              </Card>
            </div>

            {/* Sunrise/Sunset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <Sunrise className="w-8 h-8 text-orange-300" />
                  <div>
                    <p className="text-sm opacity-80">Sunrise</p>
                    <p className="text-xl font-bold">{formatTime(currentWeather.sys.sunrise)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <Sunset className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-sm opacity-80">Sunset</p>
                    <p className="text-xl font-bold">{formatTime(currentWeather.sys.sunset)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Chart */}
            {hourlyData.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white mb-8">
                <CardHeader>
                  <CardTitle className="text-white">24-Hour Temperature Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.8)" />
                      <YAxis stroke="rgba(255,255,255,0.8)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#60A5FA" 
                        fill="url(#colorTemp)" 
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 7-Day Forecast */}
            {forecast && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white">7-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {getDailyForecast().map((day, index) => (
                      <div 
                        key={index} 
                        className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      >
                        <p className="text-sm opacity-80 mb-2">
                          {day.date.toLocaleDateString([], { weekday: 'short' })}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(day.weather.icon)}
                        </div>
                        <p className="text-xs opacity-70 mb-2">{day.weather.main}</p>
                        <div className="flex justify-between text-sm">
                          <span className="font-bold">{day.maxTemp}°</span>
                          <span className="opacity-70">{day.minTemp}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
