export type OrderStatus = 'pending' | 'weighted' | 'dispatched' | 'flying' | 'delivered' | 'signed' | 'exception' | 'cancelled';

export type TaskStatus = 'queued' | 'ready' | 'flying' | 'landing' | 'completed' | 'exception';

export type DroneStatus = 'idle' | 'charging' | 'ready' | 'flying' | 'landing' | 'maintenance' | 'offline';

export interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentStock: number;
  landingPads: number;
  availablePads: number;
  status: 'active' | 'maintenance' | 'offline';
  operatingHours: string;
}

export interface LandingPad {
  id: string;
  stationId: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentDrone?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  sender: {
    name: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
  };
  package: {
    weight: number;
    size: 'small' | 'medium' | 'large';
    description: string;
  };
  status: OrderStatus;
  createTime: string;
  weightTime?: string;
  dispatchTime?: string;
  deliverTime?: string;
  signTime?: string;
  taskId?: string;
  amount: number;
  remark?: string;
}

export interface Route {
  id: string;
  startPoint: { lat: number; lng: number; name: string };
  endPoint: { lat: number; lng: number; name: string };
  waypoints: { lat: number; lng: number }[];
  distance: number;
  estimatedTime: number;
  avoidZones: string[];
}

export interface FlightTask {
  id: string;
  taskNo: string;
  orderId: string;
  droneId: string;
  route: Route;
  status: TaskStatus;
  estimatedDuration: number;
  actualDuration?: number;
  estimatedArrival: string;
  createTime: string;
  startTime?: string;
  endTime?: string;
  currentBattery: number;
  currentLat: number;
  currentLng: number;
  progress: number;
}

export interface Drone {
  id: string;
  name: string;
  model: string;
  status: DroneStatus;
  battery: number;
  maxLoad: number;
  currentLoad: number;
  currentStationId?: string;
  currentTaskId?: string;
  totalFlights: number;
  totalDistance: number;
  lastMaintenance: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  createTime: string;
}

export interface Compensation {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createTime: string;
  handler: string;
}

export interface NoFlyZone {
  id: string;
  name: string;
  type: 'airport' | 'government' | 'residential' | 'temporary';
  coordinates: { lat: number; lng: number }[];
  radius?: number;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  visibility: number;
}
