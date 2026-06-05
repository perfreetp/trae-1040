import { Bell, Search, User, Settings, Cloud, Thermometer, Wind } from 'lucide-react';
import { weatherData } from '../../mock';
import { useState } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const weatherIcons: Record<string, typeof Cloud> = {
    sunny: Cloud,
    cloudy: Cloud,
    rainy: Cloud,
    stormy: Cloud,
  };

  const WeatherIcon = weatherIcons[weatherData.weather] || Cloud;

  return (
    <header className="h-16 bg-tech-bg-light/80 backdrop-blur-md border-b border-tech-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tech-text-secondary" />
          <input
            type="text"
            placeholder="搜索订单、任务、无人机..."
            className="w-80 pl-10 pr-4 py-2 rounded-lg bg-tech-bg border border-tech-border text-sm text-tech-text placeholder-tech-text-secondary/50 focus:outline-none focus:border-tech-primary focus:ring-1 focus:ring-tech-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-tech-bg border border-tech-border">
          <div className="flex items-center gap-2">
            <WeatherIcon className="w-4 h-4 text-tech-warning" />
            <span className="text-sm text-tech-text">{weatherData.temperature}°C</span>
          </div>
          <div className="w-px h-4 bg-tech-border" />
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-tech-text-secondary" />
            <span className="text-xs text-tech-text-secondary">{weatherData.windSpeed}m/s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-tech-text-secondary" />
            <span className="text-xs text-tech-text-secondary">湿度 {weatherData.humidity}%</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-tech-text font-mono">
            {currentTime.toLocaleTimeString('zh-CN')}
          </p>
          <p className="text-xs text-tech-text-secondary">
            {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        <div className="w-px h-8 bg-tech-border" />

        <button className="relative p-2 rounded-lg hover:bg-tech-bg-lighter transition-colors">
          <Bell className="w-5 h-5 text-tech-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-tech-danger rounded-full" />
        </button>

        <button className="p-2 rounded-lg hover:bg-tech-bg-lighter transition-colors">
          <Settings className="w-5 h-5 text-tech-text-secondary" />
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tech-primary to-tech-primary-dark flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-tech-text">调度管理员</p>
            <p className="text-xs text-tech-text-secondary">运营中心</p>
          </div>
        </div>
      </div>
    </header>
  );
}
