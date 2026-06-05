import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { stations, noFlyZones } from '../mock';
import { Plane, Building2, AlertTriangle, ZoomIn, ZoomOut, Route, Clock } from 'lucide-react';
import type { Route as RouteType } from '../types';

interface MapViewProps {
  showRoutes?: boolean;
  interactive?: boolean;
  showNoFlyZones?: boolean;
  highlightRoute?: {
    original: RouteType;
    detour: RouteType;
    hasDetour: boolean;
    timeIncrease: number;
  };
}

export default function MapView({ showRoutes = true, interactive = true, showNoFlyZones = true, highlightRoute }: MapViewProps) {
  const { tasks } = useAppStore();
  const [zoom, setZoom] = useState(1);

  const baseLat = 31.2304;
  const baseLng = 121.4737;

  const mapToSvg = (lat: number, lng: number) => {
    const scale = 8000 * zoom;
    const centerX = 400;
    const centerY = 300;
    const x = (lng - baseLng) * scale + centerX;
    const y = (baseLat - lat) * scale + centerY;
    return { x, y };
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const flyingTasks = tasks.filter((t) => t.status === 'flying');

  const getNoFlyZoneColor = (type: string) => {
    switch (type) {
      case 'airport':
        return { fill: '#EF4444', stroke: '#DC2626' };
      case 'government':
        return { fill: '#F59E0B', stroke: '#D97706' };
      case 'temporary':
        return { fill: '#8B5CF6', stroke: '#7C3AED' };
      default:
        return { fill: '#EF4444', stroke: '#DC2626' };
    }
  };

  const buildPath = (route: RouteType) => {
    const start = mapToSvg(route.startPoint.lat, route.startPoint.lng);
    const end = mapToSvg(route.endPoint.lat, route.endPoint.lng);
    
    if (route.waypoints.length === 0) {
      return `M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${Math.min(start.y, end.y) - 50 * zoom} ${end.x} ${end.y}`;
    }
    
    const waypoints = route.waypoints.map((wp) => mapToSvg(wp.lat, wp.lng));
    let path = `M ${start.x} ${start.y}`;
    waypoints.forEach((wp) => {
      path += ` L ${wp.x} ${wp.y}`;
    });
    path += ` L ${end.x} ${end.y}`;
    return path;
  };

  return (
    <div className="relative w-full h-full bg-tech-bg rounded-xl overflow-hidden border border-tech-border">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
      >
        <defs>
          <pattern id="grid" width={40 / zoom} height={40 / zoom} patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <radialGradient id="stationGlow">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="noFlyZoneGradient">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="600" fill="url(#grid)" />

        <path
          d="M 0 300 Q 200 280 400 300 T 800 300"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 400 0 Q 380 200 400 400 T 400 600"
          stroke="#475569"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />

        {showNoFlyZones && noFlyZones.map((zone) => {
          const center = zone.coordinates.length > 0
            ? mapToSvg(zone.coordinates[0].lat, zone.coordinates[0].lng)
            : mapToSvg(baseLat, baseLng);
          const radius = (zone.radius || 1000) * zoom * 0.08;
          const colors = getNoFlyZoneColor(zone.type);

          return (
            <g key={zone.id}>
              <circle
                cx={center.x}
                cy={center.y}
                r={radius}
                fill="url(#noFlyZoneGradient)"
                stroke={colors.stroke}
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.8"
              />
              <circle
                cx={center.x}
                cy={center.y}
                r={radius * 0.3}
                fill={colors.fill}
                opacity="0.4"
              />
              <text
                x={center.x}
                y={center.y - radius - 5}
                textAnchor="middle"
                fill={colors.stroke}
                fontSize={10 * zoom}
                fontWeight="500"
              >
                {zone.name}
              </text>
            </g>
          );
        })}

        {highlightRoute && highlightRoute.hasDetour && (
          <>
            <path
              d={buildPath(highlightRoute.original)}
              stroke="#EF4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 6"
              opacity="0.8"
            />
            <path
              d={buildPath(highlightRoute.detour)}
              stroke="#10B981"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12 6"
              opacity="0.9"
            />
          </>
        )}

        {stations.map((station) => {
          const pos = mapToSvg(station.lat, station.lng);
          return (
            <g key={station.id}>
              <circle cx={pos.x} cy={pos.y} r={30 * zoom} fill="url(#stationGlow)" />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={12 * zoom}
                fill={station.status === 'active' ? '#10B981' : '#F59E0B'}
                opacity="0.9"
              />
              <circle cx={pos.x} cy={pos.y} r={6 * zoom} fill="#0F172A" />
              <text
                x={pos.x}
                y={pos.y + 25 * zoom}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize={10 * zoom}
              >
                {station.name}
              </text>
            </g>
          );
        })}

        {!highlightRoute && flyingTasks.map((task) => {
          const dronePos = mapToSvg(task.currentLat, task.currentLng);
          const startPos = mapToSvg(task.route.startPoint.lat, task.route.startPoint.lng);
          const endPos = mapToSvg(task.route.endPoint.lat, task.route.endPoint.lng);

          const waypoints = task.route.waypoints || [];
          let pathD = `M ${startPos.x} ${startPos.y}`;
          
          if (waypoints.length > 0) {
            waypoints.forEach((wp) => {
              const wpPos = mapToSvg(wp.lat, wp.lng);
              pathD += ` L ${wpPos.x} ${wpPos.y}`;
            });
            pathD += ` L ${endPos.x} ${endPos.y}`;
          } else {
            pathD += ` Q ${(startPos.x + endPos.x) / 2} ${Math.min(startPos.y, endPos.y) - 50 * zoom} ${endPos.x} ${endPos.y}`;
          }

          return (
            <g key={task.id}>
              {showRoutes && (
                <path
                  d={pathD}
                  stroke={task.route.avoidZones.length > 0 ? '#10B981' : '#3B82F6'}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8 4"
                  opacity="0.6"
                />
              )}
              
              <g filter="url(#glow)" className="animate-pulse">
                <polygon
                  points={`${dronePos.x},${dronePos.y - 10 * zoom} ${dronePos.x + 8 * zoom},${dronePos.y + 6 * zoom} ${dronePos.x},${dronePos.y + 2 * zoom} ${dronePos.x - 8 * zoom},${dronePos.y + 6 * zoom}`}
                  fill="#3B82F6"
                />
                <circle cx={dronePos.x} cy={dronePos.y} r={15 * zoom} fill="#3B82F6" opacity="0.2" />
              </g>
            </g>
          );
        })}

        <g transform="translate(20, 480)">
          <rect x="0" y="0" width={highlightRoute ? "240" : "220"} height={highlightRoute ? "130" : "90"} rx="8" fill="#1E293B" stroke="#334155" />
          <g transform="translate(12, 12)">
            <circle cx="8" cy="8" r="6" fill="#10B981" />
            <text x="22" y="12" fill="#94A3B8" fontSize="11">站点</text>
          </g>
          <g transform="translate(80, 12)">
            <polygon points="8,0 14,12 8,8 2,12" fill="#3B82F6" />
            <text x="22" y="12" fill="#94A3B8" fontSize="11">无人机</text>
          </g>
          <g transform="translate(12, 38)">
            <path d="M 0 8 L 40 8" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" />
            <text x="50" y="12" fill="#94A3B8" fontSize="11">正常航线</text>
          </g>
          {showNoFlyZones && (
            <g transform="translate(12, 62)">
              <circle cx="8" cy="8" r="6" fill="#EF4444" opacity="0.5" stroke="#DC2626" strokeDasharray="2 1" />
              <text x="22" y="12" fill="#94A3B8" fontSize="11">禁飞区</text>
            </g>
          )}
          {highlightRoute && highlightRoute.hasDetour && (
            <>
              <g transform="translate(12, 86)">
                <path d="M 0 8 L 40 8" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" />
                <text x="50" y="12" fill="#94A3B8" fontSize="11">原始路线</text>
              </g>
              <g transform="translate(120, 86)">
                <path d="M 0 8 L 40 8" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" />
                <text x="50" y="12" fill="#94A3B8" fontSize="11">绕行路线</text>
              </g>
              <g transform="translate(12, 108)">
                <text x="0" y="12" fill="#F59E0B" fontSize="10">
                  ⏱ 绕行增加 {highlightRoute.timeIncrease} 分钟
                </text>
              </g>
            </>
          )}
        </g>
      </svg>

      <div className="absolute top-4 right-4 glass-card p-3 space-y-2">
        <p className="text-xs font-medium text-tech-text mb-2">实时飞行</p>
        {flyingTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-xs">
            <Plane className="w-3.5 h-3.5 text-tech-primary" />
            <span className="text-tech-text-secondary font-mono">{task.taskNo.slice(-4)}</span>
            <div className="flex-1 h-1.5 bg-tech-border rounded-full overflow-hidden">
              <div
                className="h-full bg-tech-primary rounded-full transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-tech-text font-mono">{task.progress}%</span>
          </div>
        ))}
        {flyingTasks.length === 0 && (
          <p className="text-xs text-tech-text-secondary">暂无飞行任务</p>
        )}
      </div>

      {highlightRoute && highlightRoute.hasDetour && (
        <div className="absolute top-4 left-4 glass-card p-3">
          <div className="flex items-center gap-2 text-xs text-tech-warning">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">检测到禁飞区，已自动绕行</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-tech-text-secondary">原始预计</p>
              <p className="text-tech-text font-mono">{highlightRoute.original.estimatedTime} 分钟</p>
            </div>
            <div>
              <p className="text-tech-text-secondary">绕行预计</p>
              <p className="text-tech-warning font-mono">{highlightRoute.detour.estimatedTime} 分钟</p>
            </div>
          </div>
        </div>
      )}

      {interactive && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 glass-card flex items-center justify-center text-tech-text-secondary hover:text-tech-text transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 glass-card flex items-center justify-center text-tech-text-secondary hover:text-tech-text transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="text-xs text-tech-text-secondary text-center font-mono">
            {(zoom * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}
