import { useState } from 'react';
import { Plane, Clock, Battery, MapPin, Play, Pause, RotateCcw, AlertTriangle, Search, Filter, Eye, MoreHorizontal, ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDuration, formatDistance, getTaskStatusText } from '../utils/format';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const { tasks, drones, orders } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'queued', label: '排队中' },
    { value: 'ready', label: '准备起飞' },
    { value: 'flying', label: '飞行中' },
    { value: 'landing', label: '降落中' },
    { value: 'completed', label: '已完成' },
    { value: 'exception', label: '异常' },
  ];

  const filteredTasks = tasks.filter((task) => {
    const drone = drones.find((d) => d.id === task.droneId);
    const order = orders.find((o) => o.id === task.orderId);
    const matchesSearch =
      task.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order?.orderNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const queuedTasks = filteredTasks.filter((t) => t.status === 'queued');
  const readyTasks = filteredTasks.filter((t) => t.status === 'ready');
  const flyingTasks = filteredTasks.filter((t) => t.status === 'flying');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">任务中心</h1>
          <p className="text-tech-text-secondary text-sm mt-1">飞行任务管理与监控</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tech-text-secondary" />
            <input
              type="text"
              placeholder="搜索任务号、无人机..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tech-input pl-10 w-64"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="tech-button-secondary text-sm flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              筛选
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-2 w-48 glass-card p-2 z-10">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === option.value
                        ? 'bg-tech-primary/20 text-tech-primary'
                        : 'text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg-lighter'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{queuedTasks.length}</p>
              <p className="text-xs text-tech-text-secondary">排队中</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{readyTasks.length}</p>
              <p className="text-xs text-tech-text-secondary">准备起飞</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{flyingTasks.length}</p>
              <p className="text-xs text-tech-text-secondary">飞行中</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{completedTasks.length}</p>
              <p className="text-xs text-tech-text-secondary">已完成</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tech-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                任务编号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                无人机
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                关联订单
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                航线
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                进度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                电量
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tech-border">
            {filteredTasks.map((task) => {
              const drone = drones.find((d) => d.id === task.droneId);
              const order = orders.find((o) => o.id === task.orderId);

              return (
                <tr key={task.id} className="hover:bg-tech-bg-lighter/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-tech-primary font-mono text-sm hover:underline"
                    >
                      {task.taskNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-tech-primary" />
                      <span className="text-sm text-tech-text">{drone?.name || '未知'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-tech-text font-mono">{order?.orderNo || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-tech-text-secondary">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {task.route.startPoint.name} → {task.route.endPoint.name}
                      </p>
                      <p className="text-xs">
                        {formatDistance(task.route.distance)} · {formatDuration(task.estimatedDuration)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={task.status}
                      text={getTaskStatusText(task.status)}
                      pulse={task.status === 'flying'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-tech-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-tech-primary rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-tech-text font-mono">{task.progress.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${task.currentBattery > 30 ? 'text-tech-success' : 'text-tech-danger'}`} />
                      <span className={`text-sm font-medium ${task.currentBattery > 30 ? 'text-tech-success' : 'text-tech-danger'}`}>
                        {task.currentBattery.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-tech-text-secondary font-mono">
                    {formatDate(task.createTime)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="p-1.5 rounded-lg text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg-lighter transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {task.status === 'queued' && (
                        <button className="p-1.5 rounded-lg text-tech-success hover:bg-tech-success/10 transition-colors">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {task.status === 'flying' && (
                        <button className="p-1.5 rounded-lg text-tech-warning hover:bg-tech-warning/10 transition-colors">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {task.status === 'exception' && (
                        <button className="p-1.5 rounded-lg text-tech-warning hover:bg-tech-warning/10 transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
