import { useState } from 'react';
import { Search, Filter, Plus, Package, Weight, Send, CheckCircle, AlertCircle, XCircle, ChevronDown, Eye, MoreHorizontal } from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency, formatWeight, getOrderStatusText, getSizeText } from '../utils/format';
import { Link } from 'react-router-dom';
import type { Order } from '../types';

export default function Orders() {
  const { orders, updateOrderStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);

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

  const handleBatchDispatch = () => {
    const pendingOrders = filteredOrders.filter((o) => o.status === 'weighted');
    alert(`已选中 ${pendingOrders.length} 个订单进行批量派单`);
  };

  const getStatusAction = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Weight, label: '称重', action: 'weighted' };
      case 'weighted':
        return { icon: Send, label: '派单', action: 'dispatched' };
      case 'delivered':
        return { icon: CheckCircle, label: '签收', action: 'signed' };
      default:
        return null;
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
          <button className="tech-button text-sm flex items-center gap-2" onClick={handleBatchDispatch}>
            <Send className="w-4 h-4" />
            批量派单
          </button>
        </div>
      </div>

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
              return (
                <tr key={order.id} className="hover:bg-tech-bg-lighter/50 transition-colors">
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
                          onClick={() => updateOrderStatus(order.id, statusAction.action as Order['status'])}
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
        <p className="text-sm text-tech-text-secondary">显示 1-{filteredOrders.length} 条，共 {filteredOrders.length} 条</p>
        <div className="flex items-center gap-2">
          <button className="tech-button-secondary text-sm px-3 py-1.5">上一页</button>
          <button className="tech-button text-sm px-3 py-1.5">1</button>
          <button className="tech-button-secondary text-sm px-3 py-1.5">下一页</button>
        </div>
      </div>
    </div>
  );
}
