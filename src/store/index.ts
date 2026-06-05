import { create } from 'zustand';
import type { Order, FlightTask, Drone, Station, Review, Compensation, Notification, Shift, Route } from '../types';
import {
  orders as mockOrders,
  tasks as mockTasks,
  drones as mockDrones,
  stations as mockStations,
  reviews as mockReviews,
  compensations as mockCompensations,
  dailyStats,
  notifications as mockNotifications,
  shifts as mockShifts,
  noFlyZones,
  weatherData,
} from '../mock';

interface DispatchResult {
  success: boolean;
  orderId: string;
  orderNo: string;
  taskId?: string;
  reason?: string;
}

interface AppState {
  orders: Order[];
  tasks: FlightTask[];
  drones: Drone[];
  stations: Station[];
  reviews: Review[];
  compensations: Compensation[];
  notifications: Notification[];
  shifts: Shift[];
  selectedOrder: Order | null;
  selectedTask: FlightTask | null;
  stats: typeof dailyStats;
  weatherSuspended: boolean;
  currentUser: string;
  lastDispatchResults: DispatchResult[];

  setOrders: (orders: Order[]) => void;
  setTasks: (tasks: FlightTask[]) => void;
  setDrones: (drones: Drone[]) => void;
  setStations: (stations: Station[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setSelectedTask: (task: FlightTask | null) => void;
  setWeatherSuspended: (suspended: boolean) => void;
  clearDispatchResults: () => void;

  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateTaskProgress: (taskId: string, progress: number, battery: number, lat: number, lng: number) => void;
  addOrder: (order: Order) => void;
  dispatchOrder: (orderId: string, task: FlightTask) => void;
  completeTask: (taskId: string) => void;

  weighOrder: (orderId: string, weight: number) => void;
  batchWeigh: (orderIds: string[], weight: number) => void;
  batchDispatch: (orderIds: string[], droneId: string) => DispatchResult[];

  handleCompensation: (compensationId: string, status: 'approved' | 'rejected') => void;

  reassignTask: (taskId: string, newDroneId: string, newStationId?: string) => void;
  markTaskException: (taskId: string) => void;

  sendNotification: (orderId: string, type: Notification['type']) => void;
  markNotificationRead: (notificationId: string) => void;

  assignTaskToShift: (taskId: string, shiftId: string) => void;

  checkCanDispatch: (orderId: string, droneId: string) => { canDispatch: boolean; reason: string };
  calculateDetourRoute: (startPoint: { lat: number; lng: number; name: string }, endPoint: { lat: number; lng: number; name: string }) => { originalRoute: Route; detourRoute: Route; hasDetour: boolean; timeIncrease: number };
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createRoute = (
  start: { lat: number; lng: number; name: string },
  end: { lat: number; lng: number; name: string },
  waypoints: { lat: number; lng: number }[] = []
): Route => {
  const distance = Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)) * 111000;
  return {
    id: `r${generateId()}`,
    startPoint: start,
    endPoint: end,
    waypoints,
    distance,
    estimatedTime: Math.round(distance / 5000),
    avoidZones: [],
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  orders: mockOrders,
  tasks: mockTasks,
  drones: mockDrones,
  stations: mockStations,
  reviews: mockReviews,
  compensations: mockCompensations,
  notifications: mockNotifications,
  shifts: mockShifts,
  selectedOrder: null,
  selectedTask: null,
  stats: dailyStats,
  weatherSuspended: false,
  currentUser: '张调度',
  lastDispatchResults: [],

  setOrders: (orders) => set({ orders }),
  setTasks: (tasks) => set({ tasks }),
  setDrones: (drones) => set({ drones }),
  setStations: (stations) => set({ stations }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setWeatherSuspended: (suspended) => set({ weatherSuspended: suspended }),
  clearDispatchResults: () => set({ lastDispatchResults: [] }),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              signTime: status === 'signed' ? new Date().toISOString() : o.signTime,
              deliverTime: status === 'delivered' ? new Date().toISOString() : o.deliverTime,
            }
          : o
      ),
    })),

  updateTaskProgress: (taskId, progress, battery, lat, lng) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, progress, currentBattery: battery, currentLat: lat, currentLng: lng } : t
      ),
      drones: state.drones.map((d) => (d.currentTaskId === taskId ? { ...d, battery } : d)),
    })),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
      stats: { ...state.stats, todayOrders: state.stats.todayOrders + 1 },
    })),

  dispatchOrder: (orderId, task) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'dispatched', taskId: task.id, dispatchTime: new Date().toISOString() } : o
      ),
      tasks: [...state.tasks, task],
      drones: state.drones.map((d) => (d.id === task.droneId ? { ...d, status: 'ready', currentTaskId: task.id } : d)),
    })),

  completeTask: (taskId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'completed', endTime: new Date().toISOString(), progress: 100 } : t
        ),
        orders: task
          ? state.orders.map((o) =>
              o.id === task.orderId ? { ...o, status: 'delivered', deliverTime: new Date().toISOString() } : o
            )
          : state.orders,
        drones: state.drones.map((d) =>
          d.currentTaskId === taskId
            ? { ...d, status: 'idle', currentTaskId: undefined, battery: Math.max(15, d.battery - 30) }
            : d
        ),
        stats: { ...state.stats, completedOrders: state.stats.completedOrders + 1 },
      };
    }),

  weighOrder: (orderId, weight) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'weighted', package: { ...o.package, weight }, weightTime: new Date().toISOString() }
          : o
      ),
    })),

  batchWeigh: (orderIds, weight) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        orderIds.includes(o.id)
          ? { ...o, status: 'weighted', package: { ...o.package, weight }, weightTime: new Date().toISOString() }
          : o
      ),
    })),

  batchDispatch: (orderIds, droneId) => {
    const state = get();
    const now = new Date().toISOString();
    const results: DispatchResult[] = [];
    const successfulOrderIds: string[] = [];
    const newTasks: FlightTask[] = [];

    if (state.weatherSuspended) {
      orderIds.forEach((orderId) => {
        const order = state.orders.find((o) => o.id === orderId);
        results.push({
          success: false,
          orderId,
          orderNo: order?.orderNo || '',
          reason: '天气暂停，无法派单',
        });
      });
      set({ lastDispatchResults: results });
      return results;
    }

    const drone = state.drones.find((d) => d.id === droneId);
    if (!drone) {
      orderIds.forEach((orderId) => {
        const order = state.orders.find((o) => o.id === orderId);
        results.push({
          success: false,
          orderId,
          orderNo: order?.orderNo || '',
          reason: '无人机不存在',
        });
      });
      set({ lastDispatchResults: results });
      return results;
    }

    let remainingBattery = drone.battery;
    const batteryPerTask = 20;

    orderIds.forEach((orderId, index) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) {
        results.push({ success: false, orderId, orderNo: '', reason: '订单不存在' });
        return;
      }

      if (order.status !== 'weighted') {
        results.push({ success: false, orderId, orderNo: order.orderNo, reason: '订单未称重' });
        return;
      }

      if (remainingBattery < 30) {
        results.push({
          success: false,
          orderId,
          orderNo: order.orderNo,
          reason: `无人机剩余电量不足（剩余${remainingBattery.toFixed(0)}%，需≥30%）`,
        });
        return;
      }

      const startPoint = { lat: order.sender.lat, lng: order.sender.lng, name: order.sender.address };
      const endPoint = { lat: order.receiver.lat, lng: order.receiver.lng, name: order.receiver.address };
      const { detourRoute } = state.calculateDetourRoute(startPoint, endPoint);

      const taskId = `t${Date.now()}-${index}`;
      const newTask: FlightTask = {
        id: taskId,
        taskNo: `TASK${Date.now()}${String(index).padStart(3, '0')}`,
        orderId,
        droneId,
        route: detourRoute,
        status: 'queued',
        estimatedDuration: detourRoute.estimatedTime,
        estimatedArrival: new Date(Date.now() + (index + 1) * 5 * 60000).toISOString(),
        createTime: now,
        currentBattery: remainingBattery,
        currentLat: detourRoute.startPoint.lat,
        currentLng: detourRoute.startPoint.lng,
        progress: 0,
      };

      newTasks.push(newTask);
      successfulOrderIds.push(orderId);
      results.push({
        success: true,
        orderId,
        orderNo: order.orderNo,
        taskId,
      });

      remainingBattery -= batteryPerTask;
    });

    set((state) => ({
      orders: state.orders.map((o) =>
        successfulOrderIds.includes(o.id)
          ? {
              ...o,
              status: 'dispatched',
              taskId: newTasks.find((t) => t.orderId === o.id)?.id,
              dispatchTime: now,
            }
          : o
      ),
      tasks: [...state.tasks, ...newTasks],
      drones: state.drones.map((d) =>
        d.id === droneId ? { ...d, status: 'ready', currentTaskId: newTasks[0]?.id, battery: Math.max(15, remainingBattery) } : d
      ),
      lastDispatchResults: results,
    }));

    return results;
  },

  handleCompensation: (compensationId, status) =>
    set((state) => ({
      compensations: state.compensations.map((c) =>
        c.id === compensationId
          ? { ...c, status, handler: state.currentUser, handleTime: new Date().toISOString() }
          : c
      ),
    })),

  reassignTask: (taskId, newDroneId, newStationId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      if (state.weatherSuspended) {
        alert('天气暂停，无法改派任务');
        return state;
      }

      const newDrone = state.drones.find((d) => d.id === newDroneId);
      if (!newDrone || newDrone.battery < 30) {
        alert('所选无人机电池不足，请选择其他无人机');
        return state;
      }

      const oldDroneId = task.droneId;
      let newRoute = task.route;

      if (newStationId) {
        const station = state.stations.find((s) => s.id === newStationId);
        if (station) {
          const startPoint = { lat: station.lat, lng: station.lng, name: station.name };
          const endPoint = task.route.endPoint;
          const { detourRoute } = state.calculateDetourRoute(startPoint, endPoint);
          newRoute = detourRoute;
        }
      }

      const reassignmentTime = new Date().toISOString();
      const reassignmentNote = `[改派记录] ${state.currentUser} 于 ${new Date().toLocaleString('zh-CN')} 改派至 ${newDrone.name}${newStationId ? '（经停' + state.stations.find((s) => s.id === newStationId)?.name + '）' : ''}`;

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                droneId: newDroneId,
                route: newRoute,
                status: 'queued',
                progress: 0,
                estimatedDuration: newRoute.estimatedTime,
                estimatedArrival: new Date(Date.now() + newRoute.estimatedTime * 60000).toISOString(),
              }
            : t
        ),
        drones: state.drones.map((d) => {
          if (d.id === oldDroneId) return { ...d, status: 'idle', currentTaskId: undefined };
          if (d.id === newDroneId) return { ...d, status: 'ready', currentTaskId: taskId };
          return d;
        }),
        orders: state.orders.map((o) =>
          o.id === task.orderId
            ? { ...o, status: 'dispatched', remark: o.remark ? o.remark + ' | ' + reassignmentNote : reassignmentNote }
            : o
        ),
        notifications: [
          {
            id: `n${Date.now()}`,
            orderId: task.orderId,
            type: 'pickup',
            title: '任务改派通知',
            content: reassignmentNote,
            sendTime: reassignmentTime,
            sender: state.currentUser,
            read: false,
          },
          ...state.notifications,
        ],
      };
    }),

  markTaskException: (taskId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      return {
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'exception' } : t)),
        orders: task
          ? state.orders.map((o) => (o.id === task.orderId ? { ...o, status: 'exception' } : o))
          : state.orders,
        drones: state.drones.map((d) =>
          d.currentTaskId === taskId ? { ...d, status: 'idle', currentTaskId: undefined } : d
        ),
      };
    }),

  sendNotification: (orderId, type) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;

    const typeConfig = {
      pickup: { title: '取件通知', content: `您的包裹已在 ${order.sender.address} 取件成功` },
      takeoff: { title: '起飞通知', content: `无人机已起飞，正在配送您的包裹` },
      arrival: { title: '到达通知', content: `您的包裹已到达 ${order.receiver.address}，请准备签收` },
      signed: { title: '签收通知', content: `您的包裹已成功签收，感谢使用我们的服务` },
    };

    const config = typeConfig[type];
    const newNotification: Notification = {
      id: `n${Date.now()}`,
      orderId,
      type,
      title: config.title,
      content: config.content,
      sendTime: new Date().toISOString(),
      sender: get().currentUser,
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    })),

  assignTaskToShift: (taskId, shiftId) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, shiftId } : t)),
      shifts: state.shifts.map((s) =>
        s.id === shiftId ? { ...s, taskIds: [...s.taskIds, taskId] } : s
      ),
    })),

  checkCanDispatch: (orderId, droneId) => {
    const state = get();
    if (state.weatherSuspended) {
      return { canDispatch: false, reason: '天气暂停，无法派单' };
    }

    const drone = state.drones.find((d) => d.id === droneId);
    if (!drone) {
      return { canDispatch: false, reason: '无人机不存在' };
    }
    if (drone.battery < 30) {
      return { canDispatch: false, reason: '无人机电池不足（<30%）' };
    }
    if (drone.status !== 'idle') {
      return { canDispatch: false, reason: '无人机正在执行其他任务' };
    }

    const order = state.orders.find((o) => o.id === orderId);
    if (!order) {
      return { canDispatch: false, reason: '订单不存在' };
    }
    if (order.status !== 'weighted') {
      return { canDispatch: false, reason: '订单未完成称重' };
    }

    return { canDispatch: true, reason: '' };
  },

  calculateDetourRoute: (startPoint, endPoint) => {
    const originalRoute = createRoute(startPoint, endPoint);
    let hasDetour = false;
    let timeIncrease = 0;

    const midLat = (startPoint.lat + endPoint.lat) / 2;
    const midLng = (startPoint.lng + endPoint.lng) / 2;

    for (const zone of noFlyZones) {
      if (zone.radius && zone.coordinates.length > 0) {
        const zoneCenter = zone.coordinates[0];
        const distToZone = Math.sqrt(
          Math.pow(midLat - zoneCenter.lat, 2) + Math.pow(midLng - zoneCenter.lng, 2)
        ) * 111000;

        if (distToZone < zone.radius * 1000) {
          hasDetour = true;
          break;
        }
      }
    }

    let detourRoute = originalRoute;
    if (hasDetour) {
      const detourWaypoint = {
        lat: midLat + 0.008,
        lng: midLng + 0.008,
      };
      detourRoute = createRoute(startPoint, endPoint, [detourWaypoint]);
      detourRoute.avoidZones = noFlyZones.map((z) => z.id);
      timeIncrease = Math.round(detourRoute.estimatedTime * 0.25);
      detourRoute.estimatedTime += timeIncrease;
    }

    return { originalRoute, detourRoute, hasDetour, timeIncrease };
  },
}));
