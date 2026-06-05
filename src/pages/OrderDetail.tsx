import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Package,
  Clock,
  DollarSign,
  FileText,
  Send,
  Weight,
  CheckCircle,
  AlertTriangle,
  Bell,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';
import { useAppStore } from '../store';
import Timeline from '../components/Timeline';
import StatusBadge from '../components/StatusBadge';
import {
  formatDate,
  formatCurrency,
  formatWeight,
  getOrderStatusText,
  getSizeText,
  formatTime,
} from '../utils/format';
import MapView from '../components/MapView';
import type { NotificationType } from '../types';

export default function OrderDetail() {
  const { id } = useParams();
  const { orders, tasks, sendNotification, notifications, weighOrder, updateOrderStatus } = useAppStore();
  const order = orders.find((o) => o.id === id);
  const task = order?.taskId ? tasks.find((t) => t.id === order.taskId) : null;
  const orderNotifications = notifications.filter((n) => n.orderId === id);

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showWeighModal, setShowWeighModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-tech-text-secondary text-lg">订单不存在</p>
        <Link to="/orders" className="tech-button mt-4">
          返回订单列表
        </Link>
      </div>
    );
  }

  const timelineItems = [
    { title: '订单创建', description: order.sender.address, time: order.createTime, completed: true },
    {
      title: '包裹称重',
      description: `${getSizeText(order.package.size)} ${formatWeight(order.package.weight)}`,
      time: order.weightTime,
      completed: !!order.weightTime,
    },
    {
      title: '任务派单',
      description: task ? `分配至 ${task.taskNo}` : '待派单',
      time: order.dispatchTime,
      completed: !!order.dispatchTime,
    },
    {
      title: '配送中',
      description: task ? `无人机执行配送` : '等待配送',
      time: task?.startTime,
      completed: order.status === 'flying' || order.status === 'delivered' || order.status === 'signed',
      current: order.status === 'flying',
    },
    { title: '已送达', description: '包裹已送达目的地', time: order.deliverTime, completed: !!order.deliverTime },
    { title: '客户签收', description: '客户已确认签收', time: order.signTime, completed: !!order.signTime },
  ];

  const notificationTypes: { type: NotificationType; label: string; icon: string }[] = [
    { type: 'pickup', label: '取件通知', icon: '📦' },
    { type: 'takeoff', label: '起飞通知', icon: '🛫' },
    { type: 'arrival', label: '到达通知', icon: '🏠' },
    { type: 'signed', label: '签收通知', icon: '✅' },
  ];

  const handleSendNotification = (type: NotificationType) => {
    sendNotification(order.id, type);
    setShowNotifyModal(false);
  };

  const handleWeigh = () => {
    if (weightInput) {
      const weight = parseFloat(weightInput);
      if (weight > 0 && weight <= 10) {
        weighOrder(order.id, weight);
        setShowWeighModal(false);
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      pickup: '📦',
      takeoff: '🛫',
      arrival: '🏠',
      signed: '✅',
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orders" className="p-2 rounded-lg hover:bg-tech-bg-lighter transition-colors">
          <ArrowLeft className="w-5 h-5 text-tech-text-secondary" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-tech-text font-mono">{order.orderNo}</h1>
            <StatusBadge
              status={order.status}
              text={getOrderStatusText(order.status)}
              pulse={order.status === 'flying'}
            />
          </div>
          <p className="text-tech-text-secondary text-sm mt-1">创建于 {formatDate(order.createTime)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifyModal(true)}
            className="tech-button-secondary flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            发送通知
          </button>
          {order.status === 'pending' && (
            <button
              onClick={() => setShowWeighModal(true)}
              className="tech-button flex items-center gap-2"
            >
              <Weight className="w-4 h-4" />
              包裹称重
            </button>
          )}
          {order.status === 'weighted' && (
            <button className="tech-button flex items-center gap-2">
              <Send className="w-4 h-4" />
              指派任务
            </button>
          )}
          {order.status === 'delivered' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'signed')}
              className="tech-button flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              确认签收
            </button>
          )}
          {order.status === 'exception' && (
            <button className="tech-button bg-tech-danger hover:bg-tech-danger/80 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              处理异常
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-tech-primary" />
              寄件信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">寄件人</p>
                <p className="text-tech-text font-medium">{order.sender.name}</p>
                <p className="text-sm text-tech-text-secondary flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  {order.sender.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">取件地址</p>
                <p className="text-tech-text text-sm">{order.sender.address}</p>
                <p className="text-xs text-tech-text-secondary flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {order.sender.lat.toFixed(4)}, {order.sender.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-tech-success" />
              收件信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">收件人</p>
                <p className="text-tech-text font-medium">{order.receiver.name}</p>
                <p className="text-sm text-tech-text-secondary flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  {order.receiver.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">送达地址</p>
                <p className="text-tech-text text-sm">{order.receiver.address}</p>
                <p className="text-xs text-tech-text-secondary flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {order.receiver.lat.toFixed(4)}, {order.receiver.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-tech-warning" />
              包裹信息
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">物品描述</p>
                <p className="text-tech-text font-medium">{order.package.description}</p>
              </div>
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">尺寸</p>
                <p className="text-tech-text font-medium">{getSizeText(order.package.size)}</p>
              </div>
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">重量</p>
                <p className="text-tech-text font-medium">{formatWeight(order.package.weight)}</p>
              </div>
              <div>
                <p className="text-xs text-tech-text-secondary mb-1">配送费用</p>
                <p className="text-tech-text font-medium font-mono">{formatCurrency(order.amount)}</p>
              </div>
            </div>
            {order.remark && (
              <div className="mt-4 pt-4 border-t border-tech-border">
                <p className="text-xs text-tech-text-secondary mb-1">备注</p>
                <p className="text-tech-text text-sm">{order.remark}</p>
              </div>
            )}
          </div>

          {task && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-tech-primary" />
                配送地图
              </h3>
              <div className="h-64">
                <MapView />
              </div>
            </div>
          )}

          {orderNotifications.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-tech-primary" />
                通知记录
              </h3>
              <div className="space-y-3">
                {orderNotifications.map((notif) => (
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
              配送进度
            </h3>
            <Timeline items={timelineItems} />
          </div>

          {task && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-tech-text mb-4">任务信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">任务编号</span>
                  <span className="text-sm text-tech-text font-mono">{task.taskNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">预计时长</span>
                  <span className="text-sm text-tech-text">{task.estimatedDuration} 分钟</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">飞行距离</span>
                  <span className="text-sm text-tech-text">{(task.route.distance / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">当前电量</span>
                  <span
                    className={`text-sm font-medium ${task.currentBattery > 30 ? 'text-tech-success' : 'text-tech-danger'}`}
                  >
                    {task.currentBattery.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tech-text-secondary">飞行进度</span>
                  <span className="text-sm text-tech-text font-mono">{task.progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-tech-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tech-primary rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-tech-warning" />
              费用明细
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-tech-text-secondary">基础运费</span>
                <span className="text-sm text-tech-text font-mono">{formatCurrency(order.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-tech-text-secondary">重量附加费</span>
                <span className="text-sm text-tech-text font-mono">
                  {formatCurrency(order.package.weight > 2 ? (order.package.weight - 2) * 5 : 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-tech-border flex justify-between items-center">
                <span className="text-sm font-medium text-tech-text">合计</span>
                <span className="text-lg font-bold text-tech-primary font-mono">
                  {formatCurrency(order.amount + (order.package.weight > 2 ? (order.package.weight - 2) * 5 : 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {showWeighModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tech-text flex items-center gap-2">
                <Weight className="w-5 h-5 text-tech-primary" />
                包裹称重
              </h3>
              <button
                onClick={() => setShowWeighModal(false)}
                className="p-1 rounded-lg hover:bg-tech-bg-lighter text-tech-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-tech-text-secondary mb-2">包裹重量 (kg)</label>
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="输入重量，最大 10kg"
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="tech-input w-full"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWeighModal(false)}
                  className="tech-button-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleWeigh}
                  disabled={!weightInput || parseFloat(weightInput) <= 0 || parseFloat(weightInput) > 10}
                  className="tech-button flex-1 disabled:opacity-50"
                >
                  确认称重
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
