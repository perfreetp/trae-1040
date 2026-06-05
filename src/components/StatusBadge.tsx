import { getStatusColor } from '../utils/format';

interface StatusBadgeProps {
  status: string;
  text: string;
  pulse?: boolean;
}

export default function StatusBadge({ status, text, pulse = false }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium">
      <span className={`relative w-2 h-2 rounded-full ${colorClass} ${pulse ? 'animate-pulse' : ''}`}>
        {pulse && (
          <span className={`absolute inset-0 rounded-full ${colorClass} animate-ping opacity-50`} />
        )}
      </span>
      <span className="text-tech-text">{text}</span>
    </span>
  );
}
