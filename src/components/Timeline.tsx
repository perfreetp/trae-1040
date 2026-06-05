import { Check, Clock, Plane, Package, MapPin, User } from 'lucide-react';
import { formatTime } from '../utils/format';

interface TimelineItem {
  status?: string;
  title: string;
  description?: string;
  time?: string;
  completed: boolean;
  current?: boolean;
  highlight?: boolean;
  icon?: typeof Check;
}

interface TimelineProps {
  items: TimelineItem[];
}

const iconMap: Record<string, typeof Check> = {
  order: Package,
  weighted: Package,
  dispatched: Plane,
  flying: Plane,
  delivered: MapPin,
  signed: User,
};

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
          {index < items.length - 1 && (
            <div
              className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%-24px)] ${
                item.completed ? 'bg-tech-primary' : 'bg-tech-border'
              }`}
            />
          )}
          
          <div
            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              item.highlight
                ? 'bg-tech-warning text-white ring-2 ring-tech-warning/30'
                : item.completed
                ? 'bg-tech-primary text-white'
                : item.current
                ? 'bg-tech-bg border-2 border-tech-primary text-tech-primary'
                : 'bg-tech-bg border-2 border-tech-border text-tech-text-secondary'
            }`}
          >
            {item.completed ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={`font-medium text-sm ${
                  item.completed || item.current ? 'text-tech-text' : 'text-tech-text-secondary'
                }`}
              >
                {item.title}
              </p>
              {item.time && (
                <span className="text-xs text-tech-text-secondary font-mono">
                  {formatTime(item.time)}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-tech-text-secondary mt-1">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
