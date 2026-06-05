import { useAppStore } from '../store';
import { stations } from '../mock';
import { Plane, Building2, AlertTriangle } from 'lucide-react';

interface MapViewProps {
  showRoutes?: boolean;
  interactive?: boolean;
}

export default function MapView({ showRoutes = true, interactive = true }: MapViewProps) {
  const { tasks } = useAppStore();

  const mapToSvg = (lat: number, lng: number) => {
    const baseLat = 31.2304;
    const baseLng = 121.4737;
    const scale = 8000;
    const x = (lng - baseLng) * scale + 400;
    const y = (baseLat - lat) * scale + 300;
    return { x, y };
  };

  const flyingTasks = tasks.filter((t) => t.status === 'flying');

  return (
    <div className="relative w-full h-full bg-tech-bg rounded-xl overflow-hidden border border-tech-border">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
          </pattern>
          <radialGradient id="stationGlow">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
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

        {stations.map((station) => {
          const pos = mapToSvg(station.lat, station.lng);
          return (
            <g key={station.id}>
              <circle cx={pos.x} cy={pos.y} r="30" fill="url(#stationGlow)" />
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill={station.status === 'active' ? '#10B981' : '#F59E0B'}
                opacity="0.9"
              />
              <circle cx={pos.x} cy={pos.y} r="6" fill="#0F172A" />
            </g>
          );
        })}

        {flyingTasks.map((task) => {
          const dronePos = mapToSvg(task.currentLat, task.currentLng);
          const startPos = mapToSvg(task.route.startPoint.lat, task.route.startPoint.lng);
          const endPos = mapToSvg(task.route.endPoint.lat, task.route.endPoint.lng);

          return (
            <g key={task.id}>
              {showRoutes && (
                <path
                  d={`M ${startPos.x} ${startPos.y} Q ${(startPos.x + endPos.x) / 2} ${Math.min(startPos.y, endPos.y) - 50} ${endPos.x} ${endPos.y}`}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8 4"
                  opacity="0.6"
                />
              )}
              
              <g filter="url(#glow)" className="animate-pulse">
                <polygon
                  points={`${dronePos.x},${dronePos.y - 10} ${dronePos.x + 8},${dronePos.y + 6} ${dronePos.x},${dronePos.y + 2} ${dronePos.x - 8},${dronePos.y + 6}`}
                  fill="#3B82F6"
                />
                <circle cx={dronePos.x} cy={dronePos.y} r="15" fill="#3B82F6" opacity="0.2" />
              </g>
            </g>
          );
        })}

        <g transform="translate(20, 520)">
          <rect x="0" y="0" width="200" height="70" rx="8" fill="#1E293B" stroke="#334155" />
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
            <text x="50" y="12" fill="#94A3B8" fontSize="11">航线</text>
          </g>
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
      </div>

      {interactive && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="w-8 h-8 glass-card flex items-center justify-center text-tech-text-secondary hover:text-tech-text transition-colors">
            +
          </button>
          <button className="w-8 h-8 glass-card flex items-center justify-center text-tech-text-secondary hover:text-tech-text transition-colors">
            -
          </button>
        </div>
      )}
    </div>
  );
}
