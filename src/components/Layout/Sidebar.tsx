import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Map, Building2, Plane, Users, Receipt, Clock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '运营看板' },
  { path: '/orders', icon: Package, label: '订单列表' },
  { path: '/routes', icon: Map, label: '航线地图' },
  { path: '/stations', icon: Building2, label: '站点管理' },
  { path: '/tasks', icon: Plane, label: '任务中心' },
  { path: '/shifts', icon: Clock, label: '运营班次' },
  { path: '/customer', icon: Users, label: '客户服务' },
  { path: '/settlement', icon: Receipt, label: '结算报表' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`h-screen bg-tech-bg-light border-r border-tech-border flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-tech-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tech-primary to-tech-primary-dark flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-tech-text">SkyLogistics</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-tech-bg-lighter transition-colors"
        >
          <ChevronRight className={`w-5 h-5 text-tech-text-secondary transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-tech-primary/20 text-tech-primary border-l-2 border-tech-primary'
                  : 'text-tech-text-secondary hover:text-tech-text hover:bg-tech-bg-lighter'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-tech-border">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-tech-success animate-pulse" />
              <span className="text-xs text-tech-text-secondary">系统运行正常</span>
            </div>
            <p className="text-xs text-tech-text-secondary/70">v1.0.0 | 低空物流配送平台</p>
          </div>
        </div>
      )}
    </div>
  );
}
