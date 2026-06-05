import { useState } from 'react';
import { DollarSign, TrendingUp, BarChart3, PieChart, Calendar, Download, Filter, ChevronDown, Search } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../store';
import { trendData } from '../mock';
import { formatCurrency, formatDate } from '../utils/format';

export default function Settlement() {
  const { orders, stats } = useAppStore();
  const [dateRange, setDateRange] = useState('week');

  const completedOrders = orders.filter((o) => o.status === 'signed' || o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);

  const revenueTrendOption = {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 20, bottom: 30, left: 60 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
      formatter: (params: any) => {
        return `${params[0].name}<br/>营收: ¥${params[0].value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: trendData.dates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
      axisLabel: {
        color: '#94A3B8',
        fontSize: 11,
        formatter: (value: number) => `¥${value / 1000}k`,
      },
    },
    series: [
      {
        name: '营收',
        type: 'bar',
        data: trendData.revenue,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#2563EB' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 30,
      },
    ],
  };

  const orderDistributionOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#94A3B8', fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#0F172A', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 35, name: '文件小件', itemStyle: { color: '#3B82F6' } },
          { value: 28, name: '电子产品', itemStyle: { color: '#10B981' } },
          { value: 20, name: '生鲜食品', itemStyle: { color: '#F59E0B' } },
          { value: 17, name: '其他物品', itemStyle: { color: '#8B5CF6' } },
        ],
      },
    ],
  };

  const recentSettlements = completedOrders.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">结算报表</h1>
          <p className="text-tech-text-secondary text-sm mt-1">费用统计与财务分析</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="tech-button-secondary text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {dateRange === 'week' ? '本周' : dateRange === 'month' ? '本月' : '本季度'}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button className="tech-button text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-tech-text-secondary mb-1">总营收</p>
              <p className="text-2xl font-bold text-tech-text font-mono">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-tech-success" />
                <span className="text-xs text-tech-success">+12.5%</span>
                <span className="text-xs text-tech-text-secondary">较上周</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-primary/20 to-tech-primary/5 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-tech-primary" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-tech-text-secondary mb-1">完成订单</p>
              <p className="text-2xl font-bold text-tech-text font-mono">{completedOrders.length}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-tech-success" />
                <span className="text-xs text-tech-success">+8.3%</span>
                <span className="text-xs text-tech-text-secondary">较上周</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-success/20 to-tech-success/5 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-tech-success" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-tech-text-secondary mb-1">平均客单价</p>
              <p className="text-2xl font-bold text-tech-text font-mono">
                {formatCurrency(completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-tech-success" />
                <span className="text-xs text-tech-success">+3.2%</span>
                <span className="text-xs text-tech-text-secondary">较上周</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-warning/20 to-tech-warning/5 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-tech-warning" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-tech-text-secondary mb-1">赔付支出</p>
              <p className="text-2xl font-bold text-tech-text font-mono">{formatCurrency(80)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-tech-danger" />
                <span className="text-xs text-tech-danger">+25%</span>
                <span className="text-xs text-tech-text-secondary">较上周</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-danger/20 to-tech-danger/5 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-tech-danger" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-5">
          <h3 className="font-semibold text-tech-text mb-4">营收趋势</h3>
          <div className="h-72">
            <ReactECharts option={revenueTrendOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-tech-text mb-4">订单品类分布</h3>
          <div className="h-72">
            <ReactECharts option={orderDistributionOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-tech-text">最近结算</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tech-text-secondary" />
            <input
              type="text"
              placeholder="搜索订单号..."
              className="tech-input pl-10 w-64 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tech-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                  客户
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                  服务类型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                  配送费
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tech-text-secondary uppercase tracking-wider">
                  完成时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tech-border">
              {recentSettlements.map((order) => (
                <tr key={order.id} className="hover:bg-tech-bg-lighter/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-tech-text font-mono">{order.orderNo}</td>
                  <td className="px-4 py-3 text-sm text-tech-text">{order.receiver.name}</td>
                  <td className="px-4 py-3 text-sm text-tech-text-secondary">{order.package.description}</td>
                  <td className="px-4 py-3 text-sm text-tech-text font-medium font-mono">{formatCurrency(order.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-tech-success/20 text-tech-success">
                      <span className="w-2 h-2 rounded-full bg-tech-success" />
                      已结算
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-tech-text-secondary font-mono">
                    {order.signTime ? formatDate(order.signTime) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
