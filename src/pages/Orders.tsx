import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Package,
  Weight,
  Send,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  Eye,
  MoreHorizontal,
  X,
  Check,
  Plane,
  Battery,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency, formatWeight, getOrderStatusText, getSizeText } from '../utils/format';
import { Link } from 'react-router-dom';
import type { Order, Route } from '../types';
import { stations, noFlyZones, weatherData } from '../mock';

export default function Orders() {
  const {
    orders,
    drones,
    weatherSuspended,
    weighOrder,
    batchDispatch,
    updateOrderStatus,
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showWeighModal, setShowWeighModal] = useState(false);
  const [weighOrderId, setWeighOrderId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState('');
  const [dispatchError, setDispatchError] = useState('');

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'weighted', label: '已称重' },
    { value: 'dispatched', label: '已派单' },
    { value: 'flying', label: '配送中' },
    { value: 'delivered', label: '已送达' },
    { value: 'signed', label: '已签收' },
    { value: 'exception', label: '异常' },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sender.name.includes(searchQuery) ||
      order.receiver.name.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const weightedOrders = filteredOrders.filter((o) => o.status === 'weighted');
  const availableDrones = drones.filter((d) => d.status === 'idle' && d.battery >= 30);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    const weightedOrderIds = weightedOrders.map((o) => o.id);
    if (selectedOrders.length === weightedOrderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(weightedOrderIds);
    }
  };

  const openWeighModal = (orderId: string) => {
    setWeighOrderId(orderId);
    setWeightInput('');
    setShowWeighModal(true);
  };

  const handleWeigh = () => {
    if (weighOrderId && weightInput) {
      const weight = parseFloat(weightInput);
      if (weight > 0 && weight <= 10) {
        weighOrder(weighOrderId, weight);
        setShowWeighModal(false);
        setWeighOrderId(null);
      }
    }
  };

  const checkBatteryAndRoute = (droneId: string, orderIds: string[]): { valid: boolean; message: string } => {
    const drone = drones.find((d) => d.id === droneId);
    if (!drone) return { valid: false, message: '无人机不存在' };

    if (drone.battery < 30) {
      return { valid: false, message: `无人机电量过低（${drone.battery}%），请先充电` };
    }

    if (weatherSuspended || weatherData.weather === 'stormy') {
      return { valid: false, message: '当前天气条件不适宜飞行，请等待天气好转' };
    }

    if (weatherData.windSpeed > 10) {
      return { valid: false, message: `风速过大（${weatherData.windSpeed}m/s），不适宜飞行` };
    }

    const selectedOrdersList = orders.filter((o) => orderIds.includes(o.id));
    for (const order of selectedOrdersList) {
      const startStation = stations[0];
      const distance = Math.sqrt(
        Math.pow((order.receiver.lng - startStation.lng) * 111000, 2) +
        Math.pow((order.receiver.lat - startStation.lat) * 111000, 2)
      );
      const batteryNeeded = (distance / 1000) * 5;
      if (drone.battery < batteryNeeded + 20) {
        return {
          valid: false,
          message: `电量不足以完成配送，预计需要 ${(batteryNeeded + 20).toFixed(0)}%，当前 ${drone.battery}%`,
        };
      }

      for (const zone of noFlyZones) {
        if (zone.coordinates.length > 0) {
          const zoneCenter = zone.coordinates[0];
          const distToZone = Math.sqrt(
            Math.pow((order.receiver.lng - zoneCenter.lng) * 111000, 2) +
            Math.pow((order.receiver.lat - zoneCenter.lat) * 111000, 2)
          );
          if (distToZone < (zone.radius || 1000)) {
            return {
              valid: false,
              message: `配送路线经过禁飞区：${zone.name}，需要绕行`,
            };
          }
        }
      }
    }

    return { valid: true, message: '' };
  };

  const openDispatchModal = () => {
    if (selectedOrders.length === 0) {
      alert('请先选择要派单的订单');
      return;
    }
    setSelectedDrone('');
    setDispatchError('');
    setShowDispatchModal(true);
  };

  const handleBatchDispatch = () => {
    if (!selectedDrone) {
      setDispatchError('请选择执行任务的无人机');
      return;
    }

    const checkResult = checkBatteryAndRoute(selectedDrone, selectedOrders);
    if (!checkResult.valid) {
      setDispatchError(checkResult.message);
      return;
    }

    const startStation = stations[0];
    const firstOrder = orders.find((o) => o.id === selectedOrders[0]);
    if (!firstOrder) return;

    const route: Route = {
      id: `r${Date.now()}`,
      startPoint: { lat: startStation.lat, lng: startStation.lng, name: startStation.name },
      endPoint: {
        lat: firstOrder.receiver.lat,
        lng: firstOrder.receiver.lng,
        name: firstOrder.receiver.address,
      },
      waypoints: [],
      distance: 5000,
      estimatedTime: 15,
      avoidZones: noFlyZones.map((z) => z.id),
    };

    batchDispatch(selectedOrders, selectedDrone, route);
    setShowDispatchModal(false);
    setSelectedOrders([]);
  };

  const getStatusAction = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Weight, label: '称重', action: 'weigh' };
      case 'weighted':
        return { icon: Send, label: '派单', action: 'dispatch' };
      case 'delivered':
        return { icon: CheckCircle, label: '签收', action: 'signed' };
      default:
        return null;
    }
  };

  const handleAction = (order: Order, action: string) => {
    if (action === 'weigh') {
      openWeighModal(order.id);
    } else if (action === 'dispatch') {
      setSelectedOrders([order.id]);
      openDispatchModal();
    } else if (action === 'signed') {
      updateOrderStatus(order.id, 'signed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">订单列表</h1>
          <p className="text-tech-text-secondary text-sm mt-1">管理所有配送订单</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="tech-button-secondary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建订单
          </button>
          <button
            className="tech-button text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={openDispatchModal}
            disabled={selectedOrders.length === 0}
          >
            <Send className="w-4 h-4" />
            批量派单 {selectedOrders.length > 0 && `(${selectedOrders.length})`}
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
                新的飞行任务将无法派单，请在天气好转后关闭暂停
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tech-text-secondary" />
            <input
              type="text"
              placeholder="搜索订单号、寄件人、收件人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tech-input pl-10"
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

          <div className="flex items-center gap-2 text-sm text-tech-text-secondary">
            <span>共 {filteredOrders.length} 条记录</span>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tech-border">
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedOrders.length > 0 && selectedOrders.length === weightedOrders.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-tech-border bg-tech-bg text-tech-primary"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                订单号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                寄件人
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                收件人
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                包裹信息
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                费用
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tech-border">
            {filteredOrders.map((order) => {
              const statusAction = getStatusAction(order.status);
              const isSelected = selectedOrders.includes(order.id);
              const canSelect = order.status === 'weighted';

              return (
                <tr
                  key={order.id}
                  className={`hover:bg-tech-bg-lighter/50 transition-colors ${isSelected ? 'bg-tech-primary/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => canSelect && toggleOrderSelection(order.id)}
                      disabled={!canSelect}
                      className="w-4 h-4 rounded border-tech-border bg-tech-bg text-tech-primary disabled:opacity-30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-tech-primary font-mono text-sm hover:underline"
                    >
                      {order.orderNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-tech-text">{order.sender.name}</p>
                    <p className="text-xs text-tech-text-secondary">{order.sender.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-tech-text">{order.receiver.name}</p>
                    <p className="text-xs text-tech-text-secondary">{order.receiver.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-tech-text">{order.package.description}</p>
                    <p className="text-xs text-tech-text-secondary">
                      {getSizeText(order.package.size)} · {formatWeight(order.package.weight)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={order.status}
                      text={getOrderStatusText(order.status)}
                      pulse={order.status === 'flying'}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-tech-text-secondary font-mono">
                    {formatDate(order.createTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-tech-text font-medium font-mono">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/orders/${order.id}`}
                        className="p-1.5 rounded-lg text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg-lighter transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {statusAction && (
                        <button
                          onClick={() => handleAction(order, statusAction.action)}
                          className="p-1.5 rounded-lg text-tech-primary hover:bg-tech-primary/10 transition-colors"
                          title={statusAction.label}
                        >
                          <statusAction.icon className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg-lighter transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-tech-text-secondary">
          显示 1-{filteredOrders.length} 条，共 {filteredOrders.length} 条
          {selectedOrders.length > 0 && (
            <span className="ml-2 text-tech-primary">已选择 {selectedOrders.length} 个订单</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button className="tech-button-secondary text-sm px-3 py-1.5">上一页</button>
          <button className="tech-button text-sm px-3 py-1.5">1</button>
          <button className="tech-button-secondary text-sm px-3 py-1.5">下一页</button>
        </div>
      </div>

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

      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tech-text flex items-center gap-2">
                <Send className="w-5 h-5 text-tech-primary" />
                批量派单
              </h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="p-1 rounded-lg hover:bg-tech-bg-lighter text-tech-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-tech-bg">
                <p className="text-sm text-tech-text-secondary mb-1">已选订单</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrders.map((id) => {
                    const order = orders.find((o) => o.id === id);
                    return (
                      <span
                        key={id}
                        className="px-2 py-1 text-xs bg-tech-primary/20 text-tech-primary rounded font-mono"
                      >
                        {order?.orderNo}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-tech-text-secondary mb-2">选择无人机</label>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {availableDrones.length === 0 ? (
                    <p className="text-sm text-tech-text-secondary p-3 bg-tech-bg rounded-lg text-center">
                      暂无可用无人机，请等待无人机返回或充电
                    </p>
                  ) : (
                    availableDrones.map((drone) => (
                      <button
                        key={drone.id}
                        onClick={() => setSelectedDrone(drone.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedDrone === drone.id
                            ? 'bg-tech-primary/20 border border-tech-primary'
                            : 'bg-tech-bg hover:bg-tech-bg-lighter border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-tech-primary" />
                            <span className="text-sm font-medium text-tech-text">{drone.name}</span>
                            <span className="text-xs text-tech-text-secondary">{drone.model}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Battery
                              className={`w-4 h-4 ${drone.battery > 50 ? 'text-tech-success' : drone.battery > 20 ? 'text-tech-warning' : 'text-tech-danger'}`}
                            />
                            <span
                              className={`text-xs font-mono ${
                                drone.battery > 50 ? 'text-tech-success' : drone.battery > 20 ? 'text-tech-warning' : 'text-tech-danger'
                              }`}
                            >
                              {drone.battery}%
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {dispatchError && (
                <div className="p-3 rounded-lg bg-tech-danger/10 border border-tech-danger/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-tech-danger flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-tech-danger">{dispatchError}</p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-tech-bg space-y-2">
                <p className="text-xs text-tech-text-secondary">派班前检查</p>
                <div className="flex items-center gap-2 text-sm">
                  {!weatherSuspended && weatherData.weather !== 'stormy' ? (
                    <Check className="w-4 h-4 text-tech-success" />
                  ) : (
                    <X className="w-4 h-4 text-tech-danger" />
                  )}
                  <span className={!weatherSuspended && weatherData.weather !== 'stormy' ? 'text-tech-success' : 'text-tech-danger'}>
                    天气条件
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {availableDrones.length > 0 ? (
                    <Check className="w-4 h-4 text-tech-success" />
                  ) : (
                    <X className="w-4 h-4 text-tech-danger" />
                  )}
                  <span className={availableDrones.length > 0 ? 'text-tech-success' : 'text-tech-danger'}>
                    可用无人机
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="tech-button-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchDispatch}
                  disabled={!selectedDrone || availableDrones.length === 0}
                  className="tech-button flex-1 disabled:opacity-50"
                >
                  确认派单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
