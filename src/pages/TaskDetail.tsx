import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Plane,
  Battery,
  MapPin,
  Clock,
  User,
  Package,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Home,
  X,
  Check,
  RefreshCw,
  Bell,
  MessageSquare,
  Building2,
  AlertCircle,
  CloudRain,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import MapView from '../components/MapView';
import {
  formatDate,
  formatDuration,
  formatDistance,
  getTaskStatusText,
  formatWeight,
  getSizeText,
  formatTime,
} from '../utils/format';
import type { NotificationType } from '../types';

export default function TaskDetail() {
  const { id } = useParams();
  const {
    tasks,
    drones,
    orders,
    stations,
    weatherSuspended,
    setWeatherSuspended,
    markTaskException,
    reassignTask,
    sendNotification,
    notifications,
  } = useAppStore();
  const task = tasks.find((t) => t.id === id);
  const drone = task ? drones.find((d) => d.id === task.droneId) : null;
  const order = task ? orders.find((o) => o.id === task.orderId) : null;
  const taskNotifications = order ? notifications.filter((n) => n.orderId === order.id) : [];

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedNewDrone, setSelectedNewDrone] = useState('');
  const [selectedNewStation, setSelectedNewStation] = useState('');

  const notificationTypes: { type: NotificationType; label: string; icon: string }[] = [
    { type: 'pickup', label: '取件通知', icon: '📦' },
    { type: 'takeoff', label: '起飞通知', icon: '🛫' },
    { type: 'arrival', label: '到达通知', icon: '🏠' },
    { type: 'signed', label: '签收通知', icon: '✅' },
  ];

  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      pickup: '📦',
      takeoff: '🛫',
      arrival: '🏠',
      signed: '✅',
    };
    return icons[type];
  };

  const handleSendNotification = (type: NotificationType) => {
    if (order) {
      sendNotification(order.id, type);
      setShowNotifyModal(false);
    }
  };

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

  const availableDrones = drones.filter((d) => d.status === 'idle' && d.battery >= 30 && d.id !== task.droneId);
  const availableStations = stations.filter((s) => s.status === 'active');

  const handleMarkException = () => {
    if (confirm('确定要标记此任务为异常吗？')) {
      markTaskException(task.id);
    }
  };

  const handleReassign = () => {
    if (!selectedNewDrone) {
      alert('请选择新的无人机');
      return;
    }
    reassignTask(task.id, selectedNewDrone, selectedNewStation || undefined);
    setShowReassignModal(false);
    setSelectedNewDrone('');
    setSelectedNewStation('');
  };

  const reassignNotes = order?.remark?.split(' | ').filter((n) => n.startsWith('[改派记录]')) || [];

  const timelineItems = [
    { title: '任务创建', description: `任务 ${task.taskNo} 已创建`, time: task.createTime, completed: true },
    { title: '无人机待命', description: `${drone?.name || '无人机'} 已就绪`, time: task.createTime, completed: true },
    ...reassignNotes.map((note, index) => ({
      title: `改派记录 ${index + 1}`,
      description: note.replace('[改派记录] ', ''),
      time: new Date().toISOString(),
      completed: true,
      highlight: true,
    })),
    {
      title: '起飞执行',
      description: '无人机起飞执行任务',
      time: task.startTime,
      completed: !!task.startTime,
      current: task.status === 'flying',
    },
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
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              weatherSuspended
                ? 'bg-tech-warning/20 border-tech-warning text-tech-warning'
                : 'bg-tech-success/20 border-tech-success text-tech-success'
            }`}
          >
            {weatherSuspended ? <CloudRain className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            <span className="text-sm font-medium">{weatherSuspended ? '天气暂停中' : '天气正常'}</span>
            <button
              onClick={() => setWeatherSuspended(!weatherSuspended)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                weatherSuspended ? 'bg-tech-warning' : 'bg-tech-success'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                  weatherSuspended ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <button
            onClick={() => setShowNotifyModal(true)}
            className="tech-button-secondary flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            发送通知
          </button>
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
              <button
                onClick={handleMarkException}
                className="tech-button-secondary bg-tech-danger/20 border-tech-danger text-tech-danger flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                标记异常
              </button>
            </>
          )}
          {task.status === 'exception' && (
            <button
              onClick={() => setShowReassignModal(true)}
              className="tech-button bg-tech-primary hover:bg-tech-primary/80 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重新指派
            </button>
          )}
        </div>
      </div>

      {weatherSuspended && (
        <div className="glass-card p-4 border-tech-warning/50 bg-tech-warning/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-tech-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-tech-warning">天气暂停已启用</p>
              <p className="text-xs text-tech-text-secondary mt-0.5">
                当前无法进行新的派单或改派操作，请关闭天气暂停后再尝试
              </p>
            </div>
          </div>
        </div>
      )}

      {task.status === 'exception' && (
        <div className="glass-card p-4 border-tech-danger/50 bg-tech-danger/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-tech-danger flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-tech-danger">任务异常</p>
              <p className="text-xs text-tech-text-secondary mt-0.5">
                此任务已被标记为异常，请重新指派无人机或取消任务
              </p>
            </div>
          </div>
        </div>
      )}

      {reassignNotes.length > 0 && (
        <div className="glass-card p-4 border-tech-primary/50 bg-tech-primary/5">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-tech-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-tech-primary">改派记录</p>
              <div className="mt-2 space-y-1">
                {reassignNotes.map((note, index) => (
                  <p key={index} className="text-xs text-tech-text-secondary">
                    {note.replace('[改派记录] ', '')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4">实时飞行监控</h3>
            <div className="h-80">
              {task.route.originalRoute ? (
                <MapView
                  highlightRoute={{
                    original: task.route.originalRoute,
                    detour: task.route,
                    hasDetour: true,
                    timeIncrease: task.route.estimatedTime - task.route.originalRoute.estimatedTime,
                  }}
                />
              ) : (
                <MapView />
              )}
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
                  <span
                    className={`text-sm font-medium ${task.currentBattery > 30 ? 'text-tech-success' : 'text-tech-danger'}`}
                  >
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
                        task.currentBattery > 50
                          ? 'bg-tech-success'
                          : task.currentBattery > 20
                          ? 'bg-tech-warning'
                          : 'bg-tech-danger'
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
                {task.route.waypoints.length > 0 && (
                  <>
                    <div className="flex justify-center">
                      <div className="w-0.5 h-4 bg-tech-border" />
                    </div>
                    <div className="p-3 rounded-lg bg-tech-bg border border-tech-warning/30">
                      <p className="text-xs text-tech-warning mb-1">绕行点</p>
                      <p className="text-sm text-tech-text font-medium">禁飞区绕行</p>
                    </div>
                  </>
                )}
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
                {task.route.avoidZones.length > 0 && (
                  <div className="p-2 rounded-lg bg-tech-warning/10 border border-tech-warning/30">
                    <p className="text-xs text-tech-warning flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      已避开 {task.route.avoidZones.length} 个禁飞区
                    </p>
                  </div>
                )}
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

          {taskNotifications.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-tech-primary" />
                通知记录
              </h3>
              <div className="space-y-3">
                {taskNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-tech-bg hover:bg-tech-bg-lighter transition-colors"
                  >
                    <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-tech-text">{notif.title}</p>
                        <span className="text-xs text-tech-text-secondary font-mono">
                          {formatTime(notif.sendTime)}
                        </span>
                      </div>
                      <p className="text-xs text-tech-text-secondary mt-1">{notif.content}</p>
                      <p className="text-xs text-tech-text-secondary/60 mt-1">发送人：{notif.sender}</p>
                    </div>
                    {notif.read ? (
                      <Check className="w-4 h-4 text-tech-success flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-tech-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
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
                  {new Date(task.estimatedArrival).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                  <p className="text-xs text-tech-text-secondary mt-1">无人机电量低于 30%，建议立即返航</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tech-text flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-tech-primary" />
                重新指派任务
              </h3>
              <button
                onClick={() => setShowReassignModal(false)}
                className="p-1 rounded-lg hover:bg-tech-bg-lighter text-tech-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {weatherSuspended && (
              <div className="p-4 rounded-lg bg-tech-warning/20 border border-tech-warning/50 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-tech-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-tech-warning">天气暂停</p>
                    <p className="text-xs text-tech-text-secondary mt-1">
                      当前天气暂停已开启，无法进行改派操作。请先关闭天气暂停。
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-tech-bg">
                <p className="text-sm text-tech-text-secondary">
                  当前任务：<span className="text-tech-text font-mono">{task.taskNo}</span>
                </p>
                <p className="text-sm text-tech-text-secondary mt-1">
                  原无人机：<span className="text-tech-text">{drone?.name || '-'}</span>
                </p>
                <p className="text-sm text-tech-text-secondary mt-1">
                  原航线：<span className="text-tech-text">{task.route.startPoint.name} → {task.route.endPoint.name}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm text-tech-text-secondary mb-2">选择新的起飞/中转站点（可选）</label>
                <div className="space-y-2 max-h-32 overflow-auto">
                  <button
                    onClick={() => setSelectedNewStation('')}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedNewStation === ''
                        ? 'bg-tech-primary/20 border border-tech-primary'
                        : 'bg-tech-bg hover:bg-tech-bg-lighter border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-tech-primary" />
                      <span className="text-sm font-medium text-tech-text">保持原航线（不更换站点）</span>
                    </div>
                  </button>
                  {availableStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => setSelectedNewStation(station.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedNewStation === station.id
                          ? 'bg-tech-primary/20 border border-tech-primary'
                          : 'bg-tech-bg hover:bg-tech-bg-lighter border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-tech-primary" />
                          <span className="text-sm font-medium text-tech-text">{station.name}</span>
                        </div>
                        <span className="text-xs text-tech-text-secondary">{station.address}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-tech-text-secondary mb-2">选择新无人机</label>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {availableDrones.length === 0 ? (
                    <p className="text-sm text-tech-text-secondary p-3 bg-tech-bg rounded-lg text-center">
                      暂无电量充足（≥30%）的可用无人机
                    </p>
                  ) : (
                    availableDrones.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedNewDrone(d.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedNewDrone === d.id
                            ? 'bg-tech-primary/20 border border-tech-primary'
                            : 'bg-tech-bg hover:bg-tech-bg-lighter border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-tech-primary" />
                            <span className="text-sm font-medium text-tech-text">{d.name}</span>
                            <span className="text-xs text-tech-text-secondary">{d.model}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Battery
                              className={`w-4 h-4 ${
                                d.battery > 50 ? 'text-tech-success' : d.battery > 20 ? 'text-tech-warning' : 'text-tech-danger'
                              }`}
                            />
                            <span
                              className={`text-xs font-mono ${
                                d.battery > 50 ? 'text-tech-success' : d.battery > 20 ? 'text-tech-warning' : 'text-tech-danger'
                              }`}
                            >
                              {d.battery}%
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-tech-bg">
                <h4 className="text-sm font-medium text-tech-text mb-2">改派后更新</h4>
                <ul className="space-y-1 text-xs text-tech-text-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-tech-success" />
                    任务状态重置为「排队中」，进度归零
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-tech-success" />
                    订单状态更新为「已派单」
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-tech-success" />
                    时间线记录改派操作
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-tech-success" />
                    发送客户改派通知
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="tech-button-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!selectedNewDrone || availableDrones.length === 0 || weatherSuspended}
                  className="tech-button flex-1 disabled:opacity-50"
                >
                  确认改派
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tech-text flex items-center gap-2">
                <Bell className="w-5 h-5 text-tech-primary" />
                发送客户通知
              </h3>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="p-1 rounded-lg hover:bg-tech-bg-lighter text-tech-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {notificationTypes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleSendNotification(item.type)}
                  className="w-full p-3 rounded-lg bg-tech-bg hover:bg-tech-bg-lighter transition-colors flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm text-tech-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
