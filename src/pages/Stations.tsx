import { useState } from 'react';
import { Building2, MapPin, Package, Plane, Settings, Plus, Eye, MoreHorizontal, ChevronDown, Search } from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { formatDistance } from '../utils/format';

export default function Stations() {
  const { stations, drones } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStationDrones = (stationId: string) => {
    return drones.filter((d) => d.currentStationId === stationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">站点管理</h1>
          <p className="text-tech-text-secondary text-sm mt-1">管理配送站点和起降点</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tech-text-secondary" />
            <input
              type="text"
              placeholder="搜索站点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tech-input pl-10 w-64"
            />
          </div>
          <button className="tech-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增站点
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tech-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-tech-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tech-text">{stations.length}</p>
              <p className="text-xs text-tech-text-secondary">总站点数</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tech-success/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-tech-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tech-text">{stations.filter((s) => s.status === 'active').length}</p>
              <p className="text-xs text-tech-text-secondary">运营中</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tech-warning/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-tech-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tech-text">
                {stations.reduce((sum, s) => sum + s.currentStock, 0)}
              </p>
              <p className="text-xs text-tech-text-secondary">总库存</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tech-primary/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-tech-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tech-text">
                {stations.reduce((sum, s) => sum + s.availablePads, 0)}
              </p>
              <p className="text-xs text-tech-text-secondary">可用起降点</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filteredStations.map((station) => {
          const stationDrones = getStationDrones(station.id);
          const stockPercent = (station.currentStock / station.capacity) * 100;

          return (
            <div
              key={station.id}
              className="glass-card p-5 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedStation(selectedStation === station.id ? null : station.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    station.status === 'active' ? 'bg-tech-success/20' : 'bg-tech-warning/20'
                  }`}>
                    <Building2 className={`w-6 h-6 ${station.status === 'active' ? 'text-tech-success' : 'text-tech-warning'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-tech-text">{station.name}</h3>
                    <StatusBadge
                      status={station.status}
                      text={station.status === 'active' ? '运营中' : station.status === 'maintenance' ? '维护中' : '离线'}
                    />
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-tech-bg-lighter transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-tech-text-secondary" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-tech-text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-tech-text-secondary">{station.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-tech-text-secondary mb-1">库存容量</p>
                    <p className="text-sm text-tech-text font-medium">
                      {station.currentStock} / {station.capacity}
                    </p>
                    <div className="h-1.5 bg-tech-border rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stockPercent > 80 ? 'bg-tech-danger' : stockPercent > 60 ? 'bg-tech-warning' : 'bg-tech-success'
                        }`}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-tech-text-secondary mb-1">起降点</p>
                    <p className="text-sm text-tech-text font-medium">
                      {station.availablePads} / {station.landingPads} 可用
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      {Array.from({ length: station.landingPads }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded ${
                            i < station.availablePads ? 'bg-tech-success' : 'bg-tech-danger'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-tech-text-secondary">运营时间</span>
                  <span className="text-tech-text">{station.operatingHours}</span>
                </div>
              </div>

              {selectedStation === station.id && (
                <div className="mt-4 pt-4 border-t border-tech-border">
                  <p className="text-sm font-medium text-tech-text mb-3">站内无人机 ({stationDrones.length})</p>
                  <div className="space-y-2">
                    {stationDrones.length > 0 ? (
                      stationDrones.map((drone) => (
                        <div key={drone.id} className="flex items-center justify-between p-2 rounded-lg bg-tech-bg">
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-tech-primary" />
                            <span className="text-sm text-tech-text">{drone.name}</span>
                          </div>
                          <StatusBadge status={drone.status} text={drone.status === 'idle' ? '空闲' : drone.status === 'charging' ? '充电中' : '维护中'} />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-tech-text-secondary text-center py-2">暂无无人机</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
