import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plane, Battery, MapPin, Clock, User, Package, AlertTriangle, Play, Pause, RotateCcw, Home } from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import MapView from '../components/MapView';
import { formatDate, formatDuration, formatDistance, getTaskStatusText, formatWeight, getSizeText } from '../utils/format';

export default function TaskDetail() {
  const { id } = useParams();
  const { tasks, drones, orders } = useAppStore();
  const task = tasks.find((t) => t.id === id);
  const drone = task ? drones.find((d) => d.id === task.droneId) : null;
  const order = task ? orders.find((o) => o.id === task.orderId) : null;

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-tech-text-secondary text-lg">任务不存在</p>
        <Link to="/tasks" className="tech-button mt-4">
          返回任务列表
        </Link>
      </div>
    );
  }

  const timelineItems = [
    { title: '任务创建', description: `任务 ${task.taskNo} 已创建`, time: task.createTime, completed: true },
    { title: '无人机待命', description: `${drone?.name || '无人机'} 已就绪`, time: task.createTime, completed: true },
    { title: '起飞执行', description: '无人机起飞执行任务', time: task.startTime, completed: !!task.startTime, current: task.status === 'flying' },
    { title: '到达目的地', description: '包裹送达目的地', time: task.endTime, completed: !!task.endTime },
    { title: '任务完成', description: '任务执行完成', time: task.endTime, completed: task.status === 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks" className="p-2 rounded-lg hover:bg-tech-bg-lighter transition-colors">
          <ArrowLeft className="w-5 h-5 text-tech-text-secondary" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-tech-text font-mono">{task.taskNo}</h1>
            <StatusBadge status={task.status} text={getTaskStatusText(task.status)} pulse={task.status === 'flying'} />
          </div>
          <p className="text-tech-text-secondary text-sm mt-1">创建于 {formatDate(task.createTime)}</p>
        </div>
        <div className="flex items-center gap-2">
          {task.status === 'queued' && (
            <button className="tech-button flex items-center gap-2">
              <Play className="w-4 h-4" />
              启动任务
            </button>
          )}
          {task.status === 'flying' && (
            <>
              <button className="tech-button-secondary flex items-center gap-2">
                <Pause className="w-4 h-4" />
                暂停
              </button>
              <button className="tech-button-secondary bg-tech-warning/20 border-tech-warning text-tech-warning flex items-center gap-2">
                <Home className="w-4 h-4" />
                立即返航
              </button>
            </>
          )}
          {task.status === 'exception' && (
            <button className="tech-button bg-tech-danger hover:bg-tech-danger/80 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              重新指派
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4">实时飞行监控</h3>
            <div className="h-80">
              <MapView />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-tech-primary" />
                无人机信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">名称</span>
                  <span className="text-sm text-tech-text font-medium">{drone?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">型号</span>
                  <span className="text-sm text-tech-text">{drone?.model || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">当前电量</span>
                  <span className={`text-sm font-medium ${task.currentBattery > 30 ? 'text-tech-success' : 'text-tech-danger'}`}>
                    {task.currentBattery.toFixed(0)}%
                  </span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-tech-text-secondary">电量状态</span>
                  </div>
                  <div className="h-2 bg-tech-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        task.currentBattery > 50 ? 'bg-tech-success' : task.currentBattery > 20 ? 'bg-tech-warning' : 'bg-tech-danger'
                      }`}
                      style={{ width: `${task.currentBattery}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">总飞行次数</span>
                  <span className="text-sm text-tech-text font-mono">{drone?.totalFlights || 0} 次</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">总飞行里程</span>
                  <span className="text-sm text-tech-text font-mono">{drone?.totalDistance || 0} km</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-tech-success" />
                航线信息
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-tech-bg">
                  <p className="text-xs text-tech-text-secondary mb-1">起点</p>
                  <p className="text-sm text-tech-text font-medium">{task.route.startPoint.name}</p>
                  <p className="text-xs text-tech-text-secondary mt-0.5">
                    {task.route.startPoint.lat.toFixed(4)}, {task.route.startPoint.lng.toFixed(4)}
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-tech-border" />
                </div>
                <div className="p-3 rounded-lg bg-tech-bg">
                  <p className="text-xs text-tech-text-secondary mb-1">终点</p>
                  <p className="text-sm text-tech-text font-medium">{task.route.endPoint.name}</p>
                  <p className="text-xs text-tech-text-secondary mt-0.5">
                    {task.route.endPoint.lat.toFixed(4)}, {task.route.endPoint.lng.toFixed(4)}
                  </p>
                </div>
                <div className="pt-2 border-t border-tech-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-tech-text-secondary mb-1">飞行距离</p>
                    <p className="text-sm text-tech-text font-medium">{formatDistance(task.route.distance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-tech-text-secondary mb-1">预计时长</p>
                    <p className="text-sm text-tech-text font-medium">{formatDuration(task.estimatedDuration)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {order && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-tech-warning" />
                关联订单
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-tech-text-secondary mb-1">订单编号</p>
                  <Link to={`/orders/${order.id}`} className="text-sm text-tech-primary font-mono hover:underline">
                    {order.orderNo}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-tech-text-secondary mb-1">寄件人</p>
                  <p className="text-sm text-tech-text">{order.sender.name}</p>
                </div>
                <div>
                  <p className="text-xs text-tech-text-secondary mb-1">收件人</p>
                  <p className="text-sm text-tech-text">{order.receiver.name}</p>
                </div>
                <div>
                  <p className="text-xs text-tech-text-secondary mb-1">包裹</p>
                  <p className="text-sm text-tech-text">
                    {order.package.description} ({getSizeText(order.package.size)})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-tech-primary" />
              任务进度
            </h3>
            <Timeline items={timelineItems} />
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4">飞行参数</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-tech-text-secondary">当前进度</span>
                <span className="text-sm text-tech-text font-mono font-bold">{task.progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-tech-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-tech-primary rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-tech-text-secondary">预计到达</span>
                <span className="text-sm text-tech-text font-mono">
                  {new Date(task.estimatedArrival).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {task.actualDuration && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">实际用时</span>
                  <span className="text-sm text-tech-text font-mono">{formatDuration(task.actualDuration)}</span>
                </div>
              )}
            </div>
          </div>

          {task.status === 'flying' && task.currentBattery < 30 && (
            <div className="glass-card p-5 border-tech-danger/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-tech-danger flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-tech-danger">低电量告警</p>
                  <p className="text-xs text-tech-text-secondary mt-1">
                    无人机电量低于 30%，建议立即返航
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
