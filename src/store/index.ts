import { create } from 'zustand';
import type { Order, FlightTask, Drone, Station, Review, Compensation } from '../types';
import { orders as mockOrders, tasks as mockTasks, drones as mockDrones, stations as mockStations, reviews as mockReviews, compensations as mockCompensations, dailyStats } from '../mock';

interface AppState {
  orders: Order[];
  tasks: FlightTask[];
  drones: Drone[];
  stations: Station[];
  reviews: Review[];
  compensations: Compensation[];
  selectedOrder: Order | null;
  selectedTask: FlightTask | null;
  stats: typeof dailyStats;
  
  setOrders: (orders: Order[]) => void;
  setTasks: (tasks: FlightTask[]) => void;
  setDrones: (drones: Drone[]) => void;
  setStations: (stations: Station[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setSelectedTask: (task: FlightTask | null) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateTaskProgress: (taskId: string, progress: number, battery: number, lat: number, lng: number) => void;
  addOrder: (order: Order) => void;
  dispatchOrder: (orderId: string, task: FlightTask) => void;
  completeTask: (taskId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  orders: mockOrders,
  tasks: mockTasks,
  drones: mockDrones,
  stations: mockStations,
  reviews: mockReviews,
  compensations: mockCompensations,
  selectedOrder: null,
  selectedTask: null,
  stats: dailyStats,

  setOrders: (orders) => set({ orders }),
  setTasks: (tasks) => set({ tasks }),
  setDrones: (drones) => set({ drones }),
  setStations: (stations) => set({ stations }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setSelectedTask: (task) => set({ selectedTask: task }),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status, signTime: status === 'signed' ? new Date().toISOString() : o.signTime } : o
      ),
    })),

  updateTaskProgress: (taskId, progress, battery, lat, lng) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, progress, currentBattery: battery, currentLat: lat, currentLng: lng } : t
      ),
      drones: state.drones.map((d) =>
        d.currentTaskId === taskId ? { ...d, battery } : d
      ),
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
      drones: state.drones.map((d) =>
        d.id === task.droneId ? { ...d, status: 'ready', currentTaskId: task.id } : d
      ),
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
          d.currentTaskId === taskId ? { ...d, status: 'idle', currentTaskId: undefined, battery: Math.max(15, d.battery - 30) } : d
        ),
        stats: { ...state.stats, completedOrders: state.stats.completedOrders + 1 },
      };
    }),
}));
