import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  X,
  Check,
  Weight,
  Send,
  Zap,
  CloudRain,
  Map,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Route,
} from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';
import { formatDate, formatWeight, formatCurrency, formatTime, formatDuration } from '../utils/format';
import type { OrderStatus } from '../types';

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'weighted', label: '已称重' },
  { value: 'dispatched', label: '已派单' },
  { value: 'flying', label: '配送中' },
  { value: 'delivered', label: '已送达' },
  { value: 'signed', label: '已签收' },
  { value: 'exception', label: '异常' },
];

export default function Orders() {
  const {
    orders,
    drones,
    weatherSuspended,
    setWeatherSuspended,
    batchWeigh,
    batchDispatch,
    lastDispatchResults,
    clearDispatchResults,
    weighOrder,
    calculateDetourRoute,
  } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchWeight, setBatchWeight] = useState('');
  const [individualWeights, setIndividualWeights] = useState<Record<string, string>>({});
  const [selectedDrone, setSelectedDrone] = useState('');
  const [step, setStep] = useState<'weigh' | 'dispatch'>('weigh');
  const [showResults, setShowResults] = useState(false);
  const [previewOrderIndex, setPreviewOrderIndex] = useState(0);

  const routePreview = useMemo(() => {
    if (selectedOrders.length === 0) return null;
    const order = orders.find((o) => o.id === selectedOrders[previewOrderIndex]);
    if (!order) return null;
    
    const startPoint = { lat: order.sender.lat, lng: order.sender.lng, name: order.sender.address };
    const endPoint = { lat: order.receiver.lat, lng: order.receiver.lng, name: order.receiver.address };
    return calculateDetourRoute(startPoint, endPoint);
  }, [selectedOrders, previewOrderIndex, orders, calculateDetourRoute]);

  const ordersWithDetour = useMemo(() => {
    return selectedOrders.filter((id) => {
      const order = orders.find((o) => o.id === id);
      if (!order) return false;
      const startPoint = { lat: order.sender.lat, lng: order.sender.lng, name: order.sender.address };
      const endPoint = { lat: order.receiver.lat, lng: order.receiver.lng, name: order.receiver.address };
      const { hasDetour } = calculateDetourRoute(startPoint, endPoint);
      return hasDetour;
    });
  }, [selectedOrders, orders, calculateDetourRoute]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchText && !o.orderNo.includes(searchText) && !o.receiver.name.includes(searchText)) return false;
    return true;
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === 'pending');
  const weightedOrders = filteredOrders.filter((o) => o.status === 'weighted');
  const canGoToDispatch = selectedOrders.every(
    (id) => individualWeights[id] && parseFloat(individualWeights[id]) > 0
  ) || (batchWeight && parseFloat(batchWeight) > 0);

  const handleSelectAll = () => {
    const targetOrders = statusFilter === 'all' || statusFilter === 'pending' ? pendingOrders : filteredOrders;
    if (selectedOrders.length === targetOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(targetOrders.map((o) => o.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleBatchWeigh = () => {
    const ordersToWeigh = selectedOrders.filter((id) => {
      const order = orders.find((o) => o.id === id);
      return order && order.status === 'pending';
    });

    if (batchWeight && parseFloat(batchWeight) > 0) {
      batchWeigh(ordersToWeigh, parseFloat(batchWeight));
    } else {
      ordersToWeigh.forEach((id) => {
        const weight = individualWeights[id];
        if (weight && parseFloat(weight) > 0) {
          weighOrder(id, parseFloat(weight));
        }
      });
    }
    setStep('dispatch');
  };

  const handleBatchDispatch = () => {
    if (!selectedDrone) {
      alert('请选择无人机');
      return;
    }

    const ordersToDispatch = selectedOrders.filter((id) => {
      const order = orders.find((o) => o.id === id);
      return order && order.status !== 'dispatched' && order.status !== 'flying' && order.status !== 'delivered' && order.status !== 'signed';
    });

    const ordersToWeighFirst = ordersToDispatch.filter((id) => {
      const order = orders.find((o) => o.id === id);
      return order && order.status === 'pending';
    });

    if (ordersToWeighFirst.length > 0) {
      if (batchWeight && parseFloat(batchWeight) > 0) {
        batchWeigh(ordersToWeighFirst, parseFloat(batchWeight));
      } else {
        ordersToWeighFirst.forEach((id) => {
          const weight = individualWeights[id];
          if (weight && parseFloat(weight) > 0) {
            weighOrder(id, parseFloat(weight));
          }
        });
      }
    }

    setTimeout(() => {
      const { orders: updatedOrders } = useAppStore.getState();
      const validOrderIds = ordersToDispatch.filter((id) => {
        const order = updatedOrders.find((o) => o.id === id);
        return order && order.status === 'weighted';
      });

      if (validOrderIds.length > 0) {
        batchDispatch(validOrderIds, selectedDrone);
        setShowResults(true);
      } else {
        alert('没有可派单的订单，请确保订单已完成称重');
      }
    }, 50);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setShowBatchModal(false);
    setSelectedOrders([]);
    setStep('weigh');
    setBatchWeight('');
    setIndividualWeights({});
    setSelectedDrone('');
    clearDispatchResults();
  };

  const availableDrones = drones.filter((d) => d.status === 'idle' && d.battery >= 30);

  const getOrderStatusText = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      pending: '待处理',
      weighted: '已称重',
      dispatched: '已派单',
      flying: '配送中',
      delivered: '已送达',
      signed: '已签收',
      exception: '异常',
      cancelled: '已取消',
    };
    return map[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">订单列表</h1>
          <p className="text-tech-text-secondary text-sm mt-1">管理所有配送订单，支持批量处理</p>
        </div>
        <div className="flex items-center gap-3">
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
          {selectedOrders.length > 0 && (
            <button
              onClick={() => {
                setShowBatchModal(true);
                setStep('weigh');
                setShowResults(false);
              }}
              className="tech-button flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              批量处理 ({selectedOrders.length})
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
                当前无法进行新的派单操作，请关闭天气暂停后再尝试
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tech-text-secondary" />
            <input
              type="text"
              placeholder="搜索订单号或收件人..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="tech-input pl-9 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-tech-text-secondary flex-shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setSelectedOrders([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-tech-primary/20 text-tech-primary border border-tech-primary/50'
                  : 'text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg-lighter'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tech-border bg-tech-bg/50">
                <th className="text-left py-3 px-4 w-12">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-tech-border bg-tech-bg text-tech-primary focus:ring-tech-primary"
                    />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">订单编号</th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">寄件人</th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">收件人</th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">包裹信息</th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">状态</th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">金额</th>
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">创建时间</th>
                {lastDispatchResults.length > 0 && (
                  <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">派单结果</th>
                )}
                <th className="text-left py-3 px-4 text-xs text-tech-text-secondary font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const dispatchResult = lastDispatchResults.find((r) => r.orderId === order.id);
                const isDispatchSuccess = dispatchResult?.success;
                const isDispatchFailed = dispatchResult?.success === false;

                return (
                <tr
                  key={order.id}
                  className={`border-b border-tech-border/50 hover:bg-tech-bg/50 transition-colors ${
                    selectedOrders.includes(order.id) ? 'bg-tech-primary/10' : ''
                  } ${
                    isDispatchSuccess ? 'bg-tech-success/5' :
                    isDispatchFailed ? 'bg-tech-danger/5' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="w-4 h-4 rounded border-tech-border bg-tech-bg text-tech-primary focus:ring-tech-primary"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/orders/${order.id}`} className="text-sm text-tech-primary font-mono hover:underline">
                      {order.orderNo}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-tech-text">{order.sender.name}</p>
                    <p className="text-xs text-tech-text-secondary">{order.sender.address}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-tech-text">{order.receiver.name}</p>
                    <p className="text-xs text-tech-text-secondary">{order.receiver.address}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-tech-text">{order.package.description}</p>
                    <p className="text-xs text-tech-text-secondary">
                      {formatWeight(order.package.weight)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={order.status}
                      text={getOrderStatusText(order.status)}
                      pulse={order.status === 'flying'}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-tech-text font-mono">{formatCurrency(order.amount)}</td>
                  <td className="py-3 px-4 text-sm text-tech-text-secondary font-mono">
                    {formatDate(order.createTime)}
                  </td>
                  {lastDispatchResults.length > 0 && (
                    <td className="py-3 px-4">
                      {isDispatchSuccess && (
                        <span className="inline-flex items-center gap-1 text-xs text-tech-success">
                          <CheckCircle className="w-3.5 h-3.5" />
                          派单成功
                        </span>
                      )}
                      {isDispatchFailed && (
                        <span className="inline-flex items-center gap-1 text-xs text-tech-danger">
                          <XCircle className="w-3.5 h-3.5" />
                          {dispatchResult?.reason}
                        </span>
                      )}
                      {!isDispatchSuccess && !isDispatchFailed && (
                        <span className="text-xs text-tech-text-secondary">-</span>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm text-tech-primary hover:text-tech-primary-light flex items-center gap-1"
                    >
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 text-tech-text-secondary/50 mx-auto mb-3" />
            <p className="text-tech-text-secondary">暂无订单数据</p>
          </div>
        )}
      </div>

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-tech-text">批量处理订单</h3>
                <p className="text-sm text-tech-text-secondary mt-1">
                  已选择 {selectedOrders.length} 个订单
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  clearDispatchResults();
                }}
                className="p-1 rounded-lg hover:bg-tech-bg-lighter text-tech-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showResults ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      step === 'weigh' ? 'bg-tech-primary/20 text-tech-primary' : 'bg-tech-bg text-tech-text-secondary'
                    }`}
                  >
                    <Weight className="w-4 h-4" />
                    步骤1: 包裹称重
                  </div>
                  <ArrowRight className="w-4 h-4 text-tech-text-secondary" />
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      step === 'dispatch' ? 'bg-tech-primary/20 text-tech-primary' : 'bg-tech-bg text-tech-text-secondary'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    步骤2: 批量派单
                  </div>
                </div>

                {step === 'weigh' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-tech-bg">
                      <label className="block text-sm text-tech-text-secondary mb-2">批量设置重量（可选）</label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={batchWeight}
                          onChange={(e) => setBatchWeight(e.target.value)}
                          placeholder="统一输入重量 (kg)"
                          min="0.1"
                          max="10"
                          step="0.1"
                          className="tech-input flex-1"
                        />
                        <span className="text-sm text-tech-text-secondary self-center">kg</span>
                      </div>
                      <p className="text-xs text-tech-text-secondary mt-2">
                        如不设置统一重量，可在下方分别为每个订单录入重量
                      </p>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-auto">
                      {selectedOrders.map((id) => {
                        const order = orders.find((o) => o.id === id);
                        if (!order) return null;
                        return (
                          <div key={id} className="flex items-center gap-3 p-3 rounded-lg bg-tech-bg">
                            <span className="text-sm text-tech-text font-mono flex-1">{order.orderNo}</span>
                            <span className="text-xs text-tech-text-secondary">
                              {order.receiver.name} - {order.package.description}
                            </span>
                            <input
                              type="number"
                              value={individualWeights[id] || ''}
                              onChange={(e) =>
                                setIndividualWeights((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                              placeholder={order.package.weight > 0 ? formatWeight(order.package.weight) : '重量'}
                              min="0.1"
                              max="10"
                              step="0.1"
                              className="tech-input w-24 text-center"
                              disabled={order.status !== 'pending'}
                            />
                            {order.status !== 'pending' && (
                              <CheckCircle className="w-4 h-4 text-tech-success" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-tech-border">
                      <button
                        onClick={() => {
                          setShowBatchModal(false);
                        }}
                        className="tech-button-secondary flex-1"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => setStep('dispatch')}
                        className="tech-button flex-1"
                      >
                        下一步：去派单
                      </button>
                    </div>
                  </div>
                )}

                {step === 'dispatch' && (
                  <div className="space-y-4">
                    {weatherSuspended && (
                      <div className="p-4 rounded-lg bg-tech-warning/20 border border-tech-warning/50">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-tech-warning flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-tech-warning">天气暂停</p>
                            <p className="text-xs text-tech-text-secondary mt-1">
                              当前天气暂停已开启，无法进行派单操作。请先在页面顶部关闭天气暂停。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {routePreview && routePreview.hasDetour && (
                      <div className="p-4 rounded-lg bg-tech-bg border border-tech-warning/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-tech-text flex items-center gap-2">
                            <Route className="w-4 h-4 text-tech-warning" />
                            禁飞区绕行检测
                          </h4>
                          <span className="text-xs text-tech-warning">
                            {ordersWithDetour.length} 个订单需要绕行
                          </span>
                        </div>
                        {selectedOrders.length > 1 && (
                          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                            {selectedOrders.map((id, index) => {
                              const order = orders.find((o) => o.id === id);
                              return (
                                <button
                                  key={id}
                                  onClick={() => setPreviewOrderIndex(index)}
                                  className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                                    previewOrderIndex === index
                                      ? 'bg-tech-primary text-white'
                                      : 'bg-tech-bg-lighter text-tech-text-secondary hover:text-tech-text'
                                  }`}
                                >
                                  {order?.orderNo.slice(-6)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <div className="h-48 rounded-lg overflow-hidden border border-tech-border">
                          <MapView
                            showRoutes={false}
                            interactive={false}
                            showNoFlyZones={true}
                            highlightRoute={{
                              original: routePreview.originalRoute,
                              detour: routePreview.detourRoute,
                              hasDetour: routePreview.hasDetour,
                              timeIncrease: routePreview.timeIncrease,
                            }}
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                          <div className="p-2 rounded bg-tech-bg-lighter">
                            <p className="text-tech-text-secondary">原始预计</p>
                            <p className="text-tech-text font-mono mt-0.5">{formatDuration(routePreview.originalRoute.estimatedTime)}</p>
                          </div>
                          <div className="p-2 rounded bg-tech-bg-lighter">
                            <p className="text-tech-text-secondary">绕行预计</p>
                            <p className="text-tech-warning font-mono mt-0.5">{formatDuration(routePreview.detourRoute.estimatedTime)}</p>
                          </div>
                          <div className="p-2 rounded bg-tech-warning/10">
                            <p className="text-tech-text-secondary">增加时间</p>
                            <p className="text-tech-warning font-mono mt-0.5">+{formatDuration(routePreview.timeIncrease)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-tech-text-secondary mb-2">选择无人机</label>
                      <div className="space-y-2 max-h-48 overflow-auto">
                        {availableDrones.length === 0 ? (
                          <p className="text-sm text-tech-text-secondary p-3 bg-tech-bg rounded-lg text-center">
                            暂无电量充足（≥30%）的可用无人机
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
                                <div>
                                  <p className="text-sm font-medium text-tech-text">{drone.name}</p>
                                  <p className="text-xs text-tech-text-secondary">{drone.model}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      drone.battery > 50
                                        ? 'bg-tech-success'
                                        : drone.battery > 20
                                        ? 'bg-tech-warning'
                                        : 'bg-tech-danger'
                                    }`}
                                  />
                                  <span className="text-sm font-mono text-tech-text">{drone.battery}%</span>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-tech-bg">
                      <h4 className="text-sm font-medium text-tech-text mb-3">前置检查</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {!weatherSuspended ? (
                            <CheckCircle className="w-4 h-4 text-tech-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-tech-danger" />
                          )}
                          <span className="text-sm text-tech-text-secondary">天气状态正常</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {availableDrones.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-tech-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-tech-danger" />
                          )}
                          <span className="text-sm text-tech-text-secondary">
                            有可用无人机（{availableDrones.length} 架电量≥30%）
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {ordersWithDetour.length > 0 ? (
                            <AlertTriangle className="w-4 h-4 text-tech-warning" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-tech-success" />
                          )}
                          <span className="text-sm text-tech-text-secondary">
                            {ordersWithDetour.length > 0
                              ? `${ordersWithDetour.length} 个订单需绕行禁飞区`
                              : '无禁飞区冲突'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-tech-border">
                      <button
                        onClick={() => setStep('weigh')}
                        className="tech-button-secondary flex-1"
                      >
                        返回称重
                      </button>
                      <button
                        onClick={handleBatchDispatch}
                        disabled={weatherSuspended || !selectedDrone || availableDrones.length === 0}
                        className="tech-button flex-1 disabled:opacity-50"
                      >
                        确认批量派单
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-tech-text flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-tech-primary" />
                  批量派单结果
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-tech-success/20 border border-tech-success/30">
                    <p className="text-sm text-tech-success font-medium">派单成功</p>
                    <p className="text-2xl font-bold text-tech-text mt-1">
                      {lastDispatchResults.filter((r) => r.success).length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-tech-danger/20 border border-tech-danger/30">
                    <p className="text-sm text-tech-danger font-medium">派单失败</p>
                    <p className="text-2xl font-bold text-tech-text mt-1">
                      {lastDispatchResults.filter((r) => !r.success).length}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-auto">
                  {lastDispatchResults.map((result) => (
                    <div
                      key={result.orderId}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        result.success ? 'bg-tech-success/10' : 'bg-tech-danger/10'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-tech-success flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-tech-danger flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-tech-text font-mono">{result.orderNo}</p>
                        {!result.success && result.reason && (
                          <p className="text-xs text-tech-danger">{result.reason}</p>
                        )}
                        {result.success && result.taskId && (
                          <p className="text-xs text-tech-success">任务已创建：{result.taskId}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-tech-border">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setStep('weigh');
                    }}
                    className="tech-button-secondary flex-1"
                  >
                    继续处理
                  </button>
                  <button onClick={handleCloseResults} className="tech-button flex-1">
                    完成
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
