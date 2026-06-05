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

  setOrders: (orders: Order[]) => void;
  setTasks: (tasks: FlightTask[]) => void;
  setDrones: (drones: Drone[]) => void;
  setStations: (stations: Station[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setSelectedTask: (task: FlightTask | null) => void;
  setWeatherSuspended: (suspended: boolean) => void;

  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateTaskProgress: (taskId: string, progress: number, battery: number, lat: number, lng: number) => void;
  addOrder: (order: Order) => void;
  dispatchOrder: (orderId: string, task: FlightTask) => void;
  completeTask: (taskId: string) => void;

  weighOrder: (orderId: string, weight: number) => void;
  batchDispatch: (orderIds: string[], droneId: string, route: Route) => void;

  handleCompensation: (compensationId: string, status: 'approved' | 'rejected') => void;

  reassignTask: (taskId: string, newDroneId: string) => void;
  markTaskException: (taskId: string) => void;

  sendNotification: (orderId: string, type: Notification['type']) => void;
  markNotificationRead: (notificationId: string) => void;

  assignTaskToShift: (taskId: string, shiftId: string) => void;
}

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

  setOrders: (orders) => set({ orders }),
  setTasks: (tasks) => set({ tasks }),
  setDrones: (drones) => set({ drones }),
  setStations: (stations) => set({ stations }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setWeatherSuspended: (suspended) => set({ weatherSuspended: suspended }),

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

  batchDispatch: (orderIds, droneId, route) =>
    set((state) => {
      const now = new Date().toISOString();
      const newTasks: FlightTask[] = orderIds.map((orderId, index) => ({
        id: `t${Date.now()}-${index}`,
        taskNo: `TASK${Date.now()}${String(index).padStart(3, '0')}`,
        orderId,
        droneId,
        route,
        status: 'queued',
        estimatedDuration: route.estimatedTime,
        estimatedArrival: new Date(Date.now() + (index + 1) * 5 * 60000).toISOString(),
        createTime: now,
        currentBattery: state.drones.find((d) => d.id === droneId)?.battery || 100,
        currentLat: route.startPoint.lat,
        currentLng: route.startPoint.lng,
        progress: 0,
      }));

      return {
        orders: state.orders.map((o) =>
          orderIds.includes(o.id)
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
          d.id === droneId ? { ...d, status: 'ready', currentTaskId: newTasks[0]?.id } : d
        ),
      };
    }),

  handleCompensation: (compensationId, status) =>
    set((state) => ({
      compensations: state.compensations.map((c) =>
        c.id === compensationId
          ? { ...c, status, handler: state.currentUser, handleTime: new Date().toISOString() }
          : c
      ),
    })),

  reassignTask: (taskId, newDroneId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const oldDroneId = task.droneId;
      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, droneId: newDroneId, status: 'queued', progress: 0 } : t
        ),
        drones: state.drones.map((d) => {
          if (d.id === oldDroneId) return { ...d, status: 'idle', currentTaskId: undefined };
          if (d.id === newDroneId) return { ...d, status: 'ready', currentTaskId: taskId };
          return d;
        }),
        orders: state.orders.map((o) =>
          o.id === task.orderId ? { ...o, status: 'dispatched' } : o
        ),
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
      shifts: state.shifts.map((s) =>
        s.id === shiftId ? { ...s, taskIds: [...s.taskIds, taskId] } : s
      ),
    })),
}));
