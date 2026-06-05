import { useState } from 'react';
import { Map, Navigation, Layers, Cloud, Wind, AlertTriangle, Plane, MapPin, Plus, Info, CloudRain, CloudOff } from 'lucide-react';
import MapView from '../components/MapView';
import { useAppStore } from '../store';
import { weatherData, noFlyZones } from '../mock';
import StatusBadge from '../components/StatusBadge';
import { formatDistance, formatDuration } from '../utils/format';

export default function Routes() {
  const { tasks, drones, weatherSuspended, setWeatherSuspended } = useAppStore();
  const [showNoFlyZones, setShowNoFlyZones] = useState(true);
  const [showWeather, setShowWeather] = useState(true);

  const flyingTasks = tasks.filter((t) => t.status === 'flying');
  const queuedTasks = tasks.filter((t) => t.status === 'queued' || t.status === 'ready');

  const weatherIcons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '⛅',
    rainy: '🌧️',
    stormy: '⛈️',
  };

  const canFly = !weatherSuspended && weatherData.weather !== 'stormy' && weatherData.windSpeed < 10;

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">航线地图</h1>
          <p className="text-tech-text-secondary text-sm mt-1">航线规划与实时飞行监控</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`tech-button-secondary text-sm flex items-center gap-2 ${showNoFlyZones ? 'bg-tech-primary/20 border-tech-primary' : ''}`}
            onClick={() => setShowNoFlyZones(!showNoFlyZones)}
          >
            <AlertTriangle className="w-4 h-4" />
            禁飞区
          </button>
          <button
            className={`tech-button-secondary text-sm flex items-center gap-2 ${showWeather ? 'bg-tech-primary/20 border-tech-primary' : ''}`}
            onClick={() => setShowWeather(!showWeather)}
          >
            <Cloud className="w-4 h-4" />
            天气
          </button>
          <button
            className={`tech-button-secondary text-sm flex items-center gap-2 ${weatherSuspended ? 'bg-tech-warning/20 border-tech-warning text-tech-warning' : ''}`}
            onClick={() => setWeatherSuspended(!weatherSuspended)}
          >
            {weatherSuspended ? <CloudOff className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
            {weatherSuspended ? '天气暂停中' : '天气暂停'}
          </button>
          <button className="tech-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            规划航线
          </button>
        </div>
      </div>

      {weatherSuspended && (
        <div className="glass-card p-4 border-tech-warning/50 bg-tech-warning/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-tech-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-tech-warning">天气暂停已启用</p>
              <p className="text-xs text-tech-text-secondary mt-0.5">
                所有新的飞行任务将无法起飞，正在执行的任务建议立即返航
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 h-full">
        <div className="col-span-3 flex flex-col gap-4">
          <div className="flex-1 glass-card overflow-hidden">
            <MapView showRoutes={true} interactive={true} showNoFlyZones={showNoFlyZones} />
          </div>

          {showWeather && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{weatherIcons[weatherData.weather]}</span>
                    <div>
                      <p className="text-2xl font-bold text-tech-text">{weatherData.temperature}°C</p>
                      <p className="text-sm text-tech-text-secondary">
                        {weatherData.weather === 'sunny' ? '晴朗' : weatherData.weather === 'cloudy' ? '多云' : weatherData.weather === 'rainy' ? '小雨' : '暴雨'}
                      </p>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-tech-border" />
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-xs text-tech-text-secondary mb-1">风速</p>
                      <p className="text-sm text-tech-text font-medium flex items-center gap-1">
                        <Wind className="w-4 h-4 text-tech-primary" />
                        {weatherData.windSpeed} m/s
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-tech-text-secondary mb-1">湿度</p>
                      <p className="text-sm text-tech-text font-medium">{weatherData.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-tech-text-secondary mb-1">能见度</p>
                      <p className="text-sm text-tech-text font-medium">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-tech-text-secondary mb-1">飞行条件</p>
                  <StatusBadge
                    status={canFly ? 'flying' : 'exception'}
                    text={canFly ? '适宜飞行' : '不适宜飞行'}
                    pulse={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 overflow-auto">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-tech-text mb-3 flex items-center gap-2">
              <Plane className="w-4 h-4 text-tech-primary" />
              飞行中的任务 ({flyingTasks.length})
            </h3>
            <div className="space-y-3">
              {flyingTasks.map((task) => {
                const drone = drones.find((d) => d.id === task.droneId);
                return (
                  <div key={task.id} className="p-3 rounded-lg bg-tech-bg hover:bg-tech-bg-lighter transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-tech-text font-mono">{task.taskNo}</span>
                      <StatusBadge status={task.status} text="飞行中" pulse={true} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-tech-text-secondary">
                        <Plane className="w-3.5 h-3.5" />
                        <span>{drone?.name || '未知无人机'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-tech-text-secondary">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{formatDistance(task.route.distance)} · {formatDuration(task.estimatedDuration)}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-tech-text-secondary">进度</span>
                          <span className="text-tech-text font-mono">{task.progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-tech-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-tech-primary rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${task.currentBattery > 30 ? 'bg-tech-success' : 'bg-tech-danger'}`} />
                          <span className="text-xs text-tech-text-secondary">电量 {task.currentBattery.toFixed(0)}%</span>
                        </div>
                        <span className="text-xs text-tech-text-secondary font-mono">
                          预计 {new Date(task.estimatedArrival).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {showNoFlyZones && (
            <div className="glass-card p-4">
              <h3 className="font-semibold text-tech-text mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-tech-warning" />
                禁飞区域 ({noFlyZones.length})
              </h3>
              <div className="space-y-2">
                {noFlyZones.map((zone) => (
                  <div key={zone.id} className="p-3 rounded-lg bg-tech-danger/10 border border-tech-danger/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-tech-text">{zone.name}</span>
                      <span className="text-xs text-tech-danger">{(zone.radius! / 1000).toFixed(1)} km</span>
                    </div>
                    <p className="text-xs text-tech-text-secondary mt-1">
                      {zone.type === 'airport' ? '机场管制区' : zone.type === 'government' ? '政府管制区' : zone.type === 'residential' ? '居民区' : '临时管制'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-4">
            <h3 className="font-semibold text-tech-text mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-tech-success" />
              待执行任务 ({queuedTasks.length})
            </h3>
            <div className="space-y-2">
              {queuedTasks.map((task) => {
                const drone = drones.find((d) => d.id === task.droneId);
                return (
                  <div key={task.id} className="p-2.5 rounded-lg bg-tech-bg flex items-center justify-between">
                    <div>
                      <p className="text-sm text-tech-text font-mono">{task.taskNo}</p>
                      <p className="text-xs text-tech-text-secondary">{drone?.name}</p>
                    </div>
                    <StatusBadge status={task.status} text={task.status === 'ready' ? '准备起飞' : '排队中'} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
