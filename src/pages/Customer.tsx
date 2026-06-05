import { useState } from 'react';
import { Users, MessageSquare, Star, FileText, AlertCircle, Search, Filter, Plus, ChevronDown, Eye, MoreHorizontal, Check, X, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency, formatTime } from '../utils/format';

export default function Customer() {
  const { reviews, compensations, orders, handleCompensation } = useAppStore();
  const [activeTab, setActiveTab] = useState<'reviews' | 'compensations'>('reviews');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter(
    (r) =>
      r.customerName.includes(searchQuery) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompensations = compensations.filter(
    (c) =>
      c.orderId.includes(searchQuery) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-tech-warning fill-tech-warning' : 'text-tech-border'}`}
          />
        ))}
      </div>
    );
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const pendingCompensations = compensations.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">客户服务</h1>
          <p className="text-tech-text-secondary text-sm mt-1">客户评价与赔付管理</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{reviews.length}</p>
              <p className="text-xs text-tech-text-secondary">总评价数</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tech-primary/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-tech-primary" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{avgRating}</p>
              <p className="text-xs text-tech-text-secondary">平均评分</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tech-warning/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-tech-warning" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{compensations.length}</p>
              <p className="text-xs text-tech-text-secondary">赔付申请</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tech-danger/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-tech-danger" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-tech-text">{pendingCompensations}</p>
              <p className="text-xs text-tech-text-secondary">待处理</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center border-b border-tech-border">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-tech-primary border-b-2 border-tech-primary'
                : 'text-tech-text-secondary hover:text-tech-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              客户评价
            </div>
          </button>
          <button
            onClick={() => setActiveTab('compensations')}
            className={`px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'compensations'
                ? 'text-tech-primary border-b-2 border-tech-primary'
                : 'text-tech-text-secondary hover:text-tech-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              赔付登记
              {pendingCompensations > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-tech-danger text-white rounded-full">
                  {pendingCompensations}
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tech-text-secondary" />
              <input
                type="text"
                placeholder={activeTab === 'reviews' ? '搜索客户名、评价内容...' : '搜索订单号、赔付原因...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tech-input pl-10"
              />
            </div>
          </div>

          {activeTab === 'reviews' ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const order = orders.find((o) => o.id === review.orderId);
                return (
                  <div key={review.id} className="p-4 rounded-lg bg-tech-bg hover:bg-tech-bg-lighter/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tech-primary to-tech-primary-dark flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-tech-text">{review.customerName}</p>
                          <p className="text-xs text-tech-text-secondary">
                            订单号: {order?.orderNo || review.orderId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <p className="text-xs text-tech-text-secondary mt-1">{formatDate(review.createTime)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-tech-text-secondary">{review.comment}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tech-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      订单号
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      赔付金额
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      赔付原因
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      处理人
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      申请时间
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tech-border">
                  {filteredCompensations.map((comp) => (
                    <tr key={comp.id} className="hover:bg-tech-bg-lighter/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-tech-text font-mono">{comp.orderId}</td>
                      <td className="px-4 py-3 text-sm text-tech-danger font-medium font-mono">
                        {formatCurrency(comp.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-tech-text-secondary max-w-xs truncate">{comp.reason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={comp.status}
                          text={comp.status === 'pending' ? '待处理' : comp.status === 'approved' ? '已通过' : '已拒绝'}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-tech-text-secondary">
                        <div>
                          <p>{comp.handler || '-'}</p>
                          {comp.handleTime && (
                            <p className="text-xs text-tech-text-secondary/60 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatTime(comp.handleTime)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-tech-text-secondary font-mono">{formatDate(comp.createTime)}</td>
                      <td className="px-4 py-3 text-right">
                        {comp.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCompensation(comp.id, 'approved')}
                              className="p-1.5 rounded-lg text-tech-success hover:bg-tech-success/10 transition-colors"
                              title="通过"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCompensation(comp.id, 'rejected')}
                              className="p-1.5 rounded-lg text-tech-danger hover:bg-tech-danger/10 transition-colors"
                              title="拒绝"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
