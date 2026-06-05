import { useEffect } from 'react';
import { Package, Plane, Building2, CheckCircle, Clock, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import DataCard from '../components/DataCard';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import { useAppStore } from '../store';
import { trendData } from '../mock';
import { formatCurrency, formatDuration } from '../utils/format';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { stats, orders, tasks, drones, updateTaskProgress } = useAppStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tasks
        .filter((t) => t.status === 'flying')
        .forEach((task) => {
          const newProgress = Math.min(100, task.progress + Math.random() * 2);
          const newBattery = Math.max(10, task.currentBattery - Math.random() * 0.5);
          const latOffset = (Math.random() - 0.5) * 0.002;
          const lngOffset = (Math.random() - 0.5) * 0.002;
          updateTaskProgress(
            task.id,
            newProgress,
            newBattery,
            task.currentLat + latOffset,
            task.currentLng + lngOffset
          );
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [tasks, updateTaskProgress]);

  const orderTrendOption = {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
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
      axisLabel: { color: '#94A3B8', fontSize: 11 },
    },
    series: [
      {
        name: '订单量',
        type: 'line',
        data: trendData.orders,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#3B82F6', width: 2 },
        itemStyle: { color: '#3B82F6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' },
            ],
          },
        },
      },
    ],
  };

  const statusDistributionOption = {
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
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#0F172A', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 4, name: '配送中', itemStyle: { color: '#10B981' } },
          { value: 2, name: '待派单', itemStyle: { color: '#F59E0B' } },
          { value: 3, name: '待称重', itemStyle: { color: '#3B82F6' } },
          { value: 8, name: '已完成', itemStyle: { color: '#6366F1' } },
          { value: 1, name: '异常', itemStyle: { color: '#F43F5E' } },
        ],
      },
    ],
  };

  const recentTasks = tasks.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">运营看板</h1>
          <p className="text-tech-text-secondary text-sm mt-1">实时监控无人机配送运营状态</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="tech-button-secondary text-sm">导出报表</button>
          <button className="tech-button text-sm">刷新数据</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <DataCard
          title="今日订单"
          value={stats.todayOrders}
          icon={Package}
          trend={{ value: 12.5, isUp: true }}
          color="primary"
        />
        <DataCard
          title="在飞无人机"
          value={stats.flyingDrones}
          icon={Plane}
          trend={{ value: 0, isUp: true }}
          subtitle={`共 ${drones.length} 架无人机`}
          color="success"
        />
        <DataCard
          title="运营站点"
          value={stats.activeStations}
          icon={Building2}
          subtitle={`共 ${useAppStore.getState().stations.length} 个站点`}
          color="warning"
        />
        <DataCard
          title="今日营收"
          value={formatCurrency(stats.todayRevenue)}
          icon={DollarSign}
          trend={{ value: 8.3, isUp: true }}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <DataCard
          title="完成订单"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="success"
        />
        <DataCard
          title="准时率"
          value={`${stats.onTimeRate}%`}
          icon={TrendingUp}
          trend={{ value: 2.1, isUp: true }}
          color="success"
        />
        <DataCard
          title="平均配送时长"
          value={formatDuration(stats.avgDeliveryTime)}
          icon={Clock}
          trend={{ value: 5.2, isUp: false }}
          color="primary"
        />
        <DataCard
          title="客户满意度"
          value={stats.customerSatisfaction}
          icon={Users}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-tech-text">实时飞行态势</h3>
            <Link to="/routes" className="text-sm text-tech-primary hover:underline">
              查看详情 →
            </Link>
          </div>
          <div className="h-80">
            <MapView />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4">订单状态分布</h3>
            <div className="h-48">
              <ReactECharts option={statusDistributionOption} style={{ height: '100%' }} />
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-tech-text mb-4">异常告警</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-tech-danger/10 border border-tech-danger/20">
                <AlertTriangle className="w-5 h-5 text-tech-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-tech-danger">电量告警</p>
                  <p className="text-xs text-tech-text-secondary mt-0.5">
                    迅龙-005 电量低于 30%，正在返航
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-tech-warning/10 border border-tech-warning/20">
                <AlertTriangle className="w-5 h-5 text-tech-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-tech-warning">天气预警</p>
                  <p className="text-xs text-tech-text-secondary mt-0.5">
                    预计 16:00 有阵雨，建议提前调度
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-tech-text mb-4">近七日订单趋势</h3>
          <div className="h-56">
            <ReactECharts option={orderTrendOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-tech-text">飞行任务</h3>
            <Link to="/tasks" className="text-sm text-tech-primary hover:underline">
              全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-tech-bg hover:bg-tech-bg-lighter transition-colors">
                <div className="flex items-center gap-3">
                  <Plane className="w-4 h-4 text-tech-primary" />
                  <div>
                    <p className="text-sm font-medium text-tech-text font-mono">{task.taskNo}</p>
                    <p className="text-xs text-tech-text-secondary">预计 {task.estimatedDuration} 分钟</p>
                  </div>
                </div>
                <StatusBadge status={task.status} text={task.status === 'flying' ? '飞行中' : '排队中'} pulse={task.status === 'flying'} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-tech-text">最新订单</h3>
            <Link to="/orders" className="text-sm text-tech-primary hover:underline">
              全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-tech-bg hover:bg-tech-bg-lighter transition-colors">
                <div>
                  <p className="text-sm font-medium text-tech-text font-mono">{order.orderNo}</p>
                  <p className="text-xs text-tech-text-secondary">{order.receiver.name} · {order.package.description}</p>
                </div>
                <StatusBadge status={order.status} text={order.status === 'flying' ? '配送中' : order.status === 'signed' ? '已签收' : '处理中'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
