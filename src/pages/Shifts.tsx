import { useState } from 'react';
import {
  Clock,
  Plane,
  MapPin,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  User,
  Send,
} from 'lucide-react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTime, getTaskStatusText } from '../utils/format';

export default function Shifts() {
  const { shifts, tasks, stations, drones, assignTaskToShift } = useAppStore();
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');

  const unassignedTasks = tasks.filter((t) => !t.shiftId && t.status === 'queued');

  const handleAssignTask = () => {
    if (selectedShift && selectedTask) {
      assignTaskToShift(selectedTask, selectedShift);
      setShowAssignModal(false);
      setSelectedShift('');
      setSelectedTask('');
    }
  };

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-tech-success bg-tech-success/20';
      case 'upcoming':
        return 'text-tech-warning bg-tech-warning/20';
      case 'completed':
        return 'text-tech-text-secondary bg-tech-bg';
      default:
        return 'text-tech-text-secondary bg-tech-bg';
    }
  };

  const getShiftStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'upcoming':
        return '待开始';
      case 'completed':
        return '已结束';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tech-text">运营班次</h1>
          <p className="text-tech-text-secondary text-sm mt-1">
            管理每日运营班次，分配任务到各时段
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-tech-bg rounded-lg">
            <Calendar className="w-4 h-4 text-tech-text-secondary" />
            <span className="text-sm text-tech-text font-mono">{formatDate(new Date().toISOString())}</span>
          </div>
          <button
            onClick={() => {
              setShowAssignModal(true);
              setSelectedShift('');
              setSelectedTask('');
            }}
            className="tech-button flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            分配任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tech-primary/20">
              <Clock className="w-5 h-5 text-tech-primary" />
            </div>
            <div>
              <p className="text-xs text-tech-text-secondary">今日班次</p>
              <p className="text-xl font-bold text-tech-text">{shifts.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tech-success/20">
              <Plane className="w-5 h-5 text-tech-success" />
            </div>
            <div>
              <p className="text-xs text-tech-text-secondary">进行中</p>
              <p className="text-xl font-bold text-tech-text">
                {shifts.filter((s) => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tech-warning/20">
              <MapPin className="w-5 h-5 text-tech-warning" />
            </div>
            <div>
              <p className="text-xs text-tech-text-secondary">覆盖站点</p>
              <p className="text-xl font-bold text-tech-text">
                {new Set(shifts.flatMap((s) => s.stationIds)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tech-info/20">
              <Users className="w-5 h-5 text-tech-info" />
            </div>
            <div>
              <p className="text-xs text-tech-text-secondary">调度无人机</p>
              <p className="text-xl font-bold text-tech-text">
                {shifts.reduce((acc, s) => acc + s.droneCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {shifts.map((shift) => {
          const shiftStations = stations.filter((s) => shift.stationIds.includes(s.id));
          const shiftTasks = tasks.filter((t) => t.shiftId === shift.id);
          const shiftDrones = drones.slice(0, shift.droneCount);
          const isExpanded = expandedShift === shift.id;

          return (
            <div key={shift.id} className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedShift(isExpanded ? null : shift.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-tech-bg/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-tech-primary/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-tech-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-tech-text">{shift.name}</h3>
                      <p className="text-xs text-tech-text-secondary font-mono">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-tech-border" />
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-tech-text-secondary">负责人</p>
                      <p className="text-sm text-tech-text flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {shift.manager}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-tech-text-secondary">负责站点</p>
                      <p className="text-sm text-tech-text flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {shiftStations.length} 个
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-tech-text-secondary">无人机</p>
                      <p className="text-sm text-tech-text flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5" />
                        {shift.droneCount} 架
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-tech-text-secondary">任务数</p>
                      <p className="text-sm text-tech-text font-mono">{shiftTasks.length}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getShiftStatusColor(
                      shift.status
                    )}`}
                  >
                    {getShiftStatusText(shift.status)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-tech-text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-tech-text-secondary" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-tech-border p-4 space-y-4 bg-tech-bg/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-tech-text mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-tech-primary" />
                        负责站点
                      </h4>
                      <div className="space-y-2">
                        {shiftStations.map((station) => (
                          <div
                            key={station.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-tech-bg"
                          >
                            <div className="w-2 h-2 rounded-full bg-tech-primary" />
                            <span className="text-sm text-tech-text">{station.name}</span>
                            <span className="text-xs text-tech-text-secondary ml-auto">
                              {station.address}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-tech-text mb-3 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-tech-primary" />
                        调度无人机
                      </h4>
                      <div className="space-y-2">
                        {shiftDrones.map((drone) => (
                          <div
                            key={drone.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-tech-bg"
                          >
                            <div className="w-2 h-2 rounded-full bg-tech-success" />
                            <span className="text-sm text-tech-text">{drone.name}</span>
                            <span className="text-xs text-tech-text-secondary">
                              {drone.model}
                            </span>
                            <span
                              className={`text-xs font-mono ml-auto ${
                                drone.battery > 50
                                  ? 'text-tech-success'
                                  : drone.battery > 20
                                  ? 'text-tech-warning'
                                  : 'text-tech-danger'
                              }`}
                            >
                              {drone.battery}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {shiftTasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-tech-text mb-3">班次任务</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-tech-border">
                              <th className="text-left py-2 px-3 text-xs text-tech-text-secondary font-medium">
                                任务编号
                              </th>
                              <th className="text-left py-2 px-3 text-xs text-tech-text-secondary font-medium">
                                状态
                              </th>
                              <th className="text-left py-2 px-3 text-xs text-tech-text-secondary font-medium">
                                起点
                              </th>
                              <th className="text-left py-2 px-3 text-xs text-tech-text-secondary font-medium">
                                终点
                              </th>
                              <th className="text-left py-2 px-3 text-xs text-tech-text-secondary font-medium">
                                无人机
                              </th>
                              <th className="text-left py-2 px-3 text-xs text-tech-text-secondary font-medium">
                                进度
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {shiftTasks.map((task) => {
                              const taskDrone = drones.find((d) => d.id === task.droneId);
                              return (
                                <tr
                                  key={task.id}
                                  className="border-b border-tech-border/50 hover:bg-tech-bg/50 transition-colors"
                                >
                                  <td className="py-3 px-3 text-sm text-tech-primary font-mono">
                                    {task.taskNo}
                                  </td>
                                  <td className="py-3 px-3">
                                    <StatusBadge
                                      status={task.status}
                                      text={getTaskStatusText(task.status)}
                                    />
                                  </td>
                                  <td className="py-3 px-3 text-sm text-tech-text">
                                    {task.route.startPoint.name}
                                  </td>
                                  <td className="py-3 px-3 text-sm text-tech-text">
                                    {task.route.endPoint.name}
                                  </td>
                                  <td className="py-3 px-3 text-sm text-tech-text">
                                    {taskDrone?.name || '-'}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-tech-border rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-tech-primary rounded-full"
                                          style={{ width: `${task.progress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-tech-text-secondary font-mono w-10">
                                        {task.progress.toFixed(0)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-tech-text">分配任务到班次</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg hover:bg-tech-bg-lighter text-tech-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-tech-text-secondary mb-2">选择班次</label>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {shifts
                    .filter((s) => s.status !== 'completed')
                    .map((shift) => (
                      <button
                        key={shift.id}
                        onClick={() => setSelectedShift(shift.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedShift === shift.id
                            ? 'bg-tech-primary/20 border border-tech-primary'
                            : 'bg-tech-bg hover:bg-tech-bg-lighter border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-tech-text">{shift.name}</p>
                            <p className="text-xs text-tech-text-secondary font-mono">
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </p>
                          </div>
                          {selectedShift === shift.id && (
                            <Check className="w-5 h-5 text-tech-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-tech-text-secondary mb-2">选择待分配任务</label>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {unassignedTasks.length === 0 ? (
                    <p className="text-sm text-tech-text-secondary p-3 bg-tech-bg rounded-lg text-center">
                      暂无待分配的任务
                    </p>
                  ) : (
                    unassignedTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedTask === task.id
                            ? 'bg-tech-primary/20 border border-tech-primary'
                            : 'bg-tech-bg hover:bg-tech-bg-lighter border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-tech-text font-mono">
                              {task.taskNo}
                            </p>
                            <p className="text-xs text-tech-text-secondary">
                              {task.route.startPoint.name} → {task.route.endPoint.name}
                            </p>
                          </div>
                          {selectedTask === task.id && (
                            <Check className="w-5 h-5 text-tech-primary" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="tech-button-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleAssignTask}
                  disabled={!selectedShift || !selectedTask}
                  className="tech-button flex-1 disabled:opacity-50"
                >
                  确认分配
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
