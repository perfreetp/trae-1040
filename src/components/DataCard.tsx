import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function DataCard({ title, value, icon: Icon, trend, subtitle, color = 'primary' }: DataCardProps) {
  const colorClasses = {
    primary: 'from-tech-primary/20 to-tech-primary/5 text-tech-primary',
    success: 'from-tech-success/20 to-tech-success/5 text-tech-success',
    warning: 'from-tech-warning/20 to-tech-warning/5 text-tech-warning',
    danger: 'from-tech-danger/20 to-tech-danger/5 text-tech-danger',
  };

  return (
    <div className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-tech-text-secondary text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-tech-text font-mono group-hover:scale-105 transition-transform duration-300">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isUp ? (
                <TrendingUp className="w-4 h-4 text-tech-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-tech-danger" />
              )}
              <span className={`text-xs font-medium ${trend.isUp ? 'text-tech-success' : 'text-tech-danger'}`}>
                {trend.isUp ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-tech-text-secondary">较昨日</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-tech-text-secondary mt-2">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
