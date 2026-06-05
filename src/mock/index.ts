import type { Station, Drone, Order, FlightTask, Review, Compensation, NoFlyZone, WeatherData, Route, Notification, Shift } from '../types';

const baseLat = 31.2304;
const baseLng = 121.4737;

const randomOffset = () => (Math.random() - 0.5) * 0.1;

export const stations: Station[] = [
  { id: 's1', name: '浦东中枢站', address: '上海市浦东新区世纪大道100号', lat: baseLat + 0.02, lng: baseLng + 0.03, capacity: 200, currentStock: 85, landingPads: 6, availablePads: 3, status: 'active', operatingHours: '06:00-22:00' },
  { id: 's2', name: '虹桥配送站', address: '上海市闵行区虹桥路2550号', lat: baseLat - 0.01, lng: baseLng - 0.04, capacity: 150, currentStock: 62, landingPads: 4, availablePads: 2, status: 'active', operatingHours: '06:00-22:00' },
  { id: 's3', name: '静安中心站', address: '上海市静安区南京西路1266号', lat: baseLat + 0.01, lng: baseLng - 0.01, capacity: 100, currentStock: 45, landingPads: 3, availablePads: 1, status: 'active', operatingHours: '07:00-21:00' },
  { id: 's4', name: '徐汇科技园站', address: '上海市徐汇区漕河泾开发区', lat: baseLat - 0.03, lng: baseLng + 0.01, capacity: 120, currentStock: 38, landingPads: 4, availablePads: 3, status: 'maintenance', operatingHours: '06:00-22:00' },
  { id: 's5', name: '杨浦大学城站', address: '上海市杨浦区邯郸路220号', lat: baseLat + 0.04, lng: baseLng + 0.02, capacity: 80, currentStock: 28, landingPads: 3, availablePads: 2, status: 'active', operatingHours: '08:00-20:00' },
  { id: 's6', name: '宝山物流园站', address: '上海市宝山区牡丹江路1000号', lat: baseLat + 0.06, lng: baseLng - 0.02, capacity: 180, currentStock: 95, landingPads: 5, availablePads: 4, status: 'active', operatingHours: '05:00-23:00' },
];

export const drones: Drone[] = [
  { id: 'd1', name: '迅龙-001', model: 'DJI Matrice 300', status: 'flying', battery: 78, maxLoad: 5, currentLoad: 2.5, currentTaskId: 't1', totalFlights: 256, totalDistance: 1280, lastMaintenance: '2026-06-01' },
  { id: 'd2', name: '迅龙-002', model: 'DJI Matrice 300', status: 'flying', battery: 65, maxLoad: 5, currentLoad: 3.2, currentTaskId: 't2', totalFlights: 312, totalDistance: 1560, lastMaintenance: '2026-06-02' },
  { id: 'd3', name: '迅龙-003', model: 'DJI Matrice 300', status: 'idle', battery: 100, maxLoad: 5, currentLoad: 0, currentStationId: 's1', totalFlights: 189, totalDistance: 945, lastMaintenance: '2026-06-03' },
  { id: 'd4', name: '迅龙-004', model: 'DJI Matrice 300', status: 'charging', battery: 45, maxLoad: 5, currentLoad: 0, currentStationId: 's2', totalFlights: 278, totalDistance: 1390, lastMaintenance: '2026-06-01' },
  { id: 'd5', name: '翼虎-001', model: 'WINGTRA Gen II', status: 'flying', battery: 82, maxLoad: 10, currentLoad: 7.5, currentTaskId: 't3', totalFlights: 145, totalDistance: 2175, lastMaintenance: '2026-05-28' },
  { id: 'd6', name: '翼虎-002', model: 'WINGTRA Gen II', status: 'idle', battery: 95, maxLoad: 10, currentLoad: 0, currentStationId: 's1', totalFlights: 167, totalDistance: 2505, lastMaintenance: '2026-06-01' },
  { id: 'd7', name: '蜂鸟-001', model: 'DJI Mavic 3', status: 'maintenance', battery: 0, maxLoad: 1, currentLoad: 0, currentStationId: 's4', totalFlights: 423, totalDistance: 846, lastMaintenance: '2026-06-06' },
  { id: 'd8', name: '蜂鸟-002', model: 'DJI Mavic 3', status: 'flying', battery: 55, maxLoad: 1, currentLoad: 0.8, currentTaskId: 't4', totalFlights: 389, totalDistance: 778, lastMaintenance: '2026-06-04' },
  { id: 'd9', name: '迅龙-005', model: 'DJI Matrice 300', status: 'landing', battery: 25, maxLoad: 5, currentLoad: 0, currentStationId: 's3', totalFlights: 298, totalDistance: 1490, lastMaintenance: '2026-06-02' },
  { id: 'd10', name: '迅龙-006', model: 'DJI Matrice 300', status: 'offline', battery: 0, maxLoad: 5, currentLoad: 0, currentStationId: 's6', totalFlights: 156, totalDistance: 780, lastMaintenance: '2026-05-20' },
];

const generateOrder = (id: number, status: Order['status']): Order => {
  const orderNo = `ORD${String(20260606000 + id).padStart(12, '0')}`;
  const names = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十', '郑十一', '孙十二'];
  const addresses = [
    '上海市浦东新区陆家嘴环路1000号',
    '上海市黄浦区南京东路300号',
    '上海市静安区静安寺街道',
    '上海市徐汇区衡山路890号',
    '上海市长宁区虹桥路1440号',
    '上海市普陀区长寿路1118号',
    '上海市虹口区四川北路1688号',
    '上海市杨浦区四平路1239号',
    '上海市宝山区同济路100号',
    '上海市闵行区沪闵路6088号',
  ];
  const packages = ['文件', '电子产品', '生鲜食品', '药品', '服装', '图书', '化妆品', '数码配件'];
  const sizes: Order['package']['size'][] = ['small', 'medium', 'large'];
  const senderIdx = Math.floor(Math.random() * names.length);
  const receiverIdx = (senderIdx + 3) % names.length;

  return {
    id: `o${id}`,
    orderNo,
    sender: {
      name: names[senderIdx],
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      address: addresses[senderIdx],
      lat: baseLat + randomOffset(),
      lng: baseLng + randomOffset(),
    },
    receiver: {
      name: names[receiverIdx],
      phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      address: addresses[receiverIdx],
      lat: baseLat + randomOffset(),
      lng: baseLng + randomOffset(),
    },
    package: {
      weight: Math.round((Math.random() * 4.5 + 0.5) * 10) / 10,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      description: packages[Math.floor(Math.random() * packages.length)],
    },
    status,
    createTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    amount: Math.round(Math.random() * 80 + 20),
  };
};

export const orders: Order[] = [
  generateOrder(1, 'flying'),
  generateOrder(2, 'flying'),
  generateOrder(3, 'flying'),
  generateOrder(4, 'flying'),
  generateOrder(5, 'delivered'),
  generateOrder(6, 'signed'),
  generateOrder(7, 'signed'),
  generateOrder(8, 'dispatched'),
  generateOrder(9, 'dispatched'),
  generateOrder(10, 'weighted'),
  generateOrder(11, 'weighted'),
  generateOrder(12, 'pending'),
  generateOrder(13, 'pending'),
  generateOrder(14, 'pending'),
  generateOrder(15, 'signed'),
  generateOrder(16, 'signed'),
  generateOrder(17, 'exception'),
  generateOrder(18, 'signed'),
  generateOrder(19, 'delivered'),
  generateOrder(20, 'signed'),
];

orders[0].taskId = 't1';
orders[1].taskId = 't2';
orders[2].taskId = 't3';
orders[3].taskId = 't4';

const generateRoute = (startStation: Station, endLat: number, endLng: number): Route => {
  return {
    id: `r${Math.floor(Math.random() * 1000)}`,
    startPoint: { lat: startStation.lat, lng: startStation.lng, name: startStation.name },
    endPoint: { lat: endLat, lng: endLng, name: '目的地' },
    waypoints: [
      { lat: startStation.lat + 0.005, lng: startStation.lng + 0.005 },
      { lat: endLat - 0.005, lng: endLng - 0.005 },
    ],
    distance: Math.round(Math.random() * 8000 + 2000),
    estimatedTime: Math.round(Math.random() * 15 + 10),
    avoidZones: [],
  };
};

export const tasks: FlightTask[] = [
  {
    id: 't1',
    taskNo: 'TASK20260606001',
    orderId: 'o1',
    droneId: 'd1',
    route: generateRoute(stations[0], orders[0].receiver.lat, orders[0].receiver.lng),
    status: 'flying',
    estimatedDuration: 18,
    estimatedArrival: new Date(Date.now() + 8 * 60000).toISOString(),
    createTime: new Date(Date.now() - 12 * 60000).toISOString(),
    startTime: new Date(Date.now() - 10 * 60000).toISOString(),
    currentBattery: 78,
    currentLat: baseLat + 0.015,
    currentLng: baseLng + 0.025,
    progress: 55,
  },
  {
    id: 't2',
    taskNo: 'TASK20260606002',
    orderId: 'o2',
    droneId: 'd2',
    route: generateRoute(stations[1], orders[1].receiver.lat, orders[1].receiver.lng),
    status: 'flying',
    estimatedDuration: 22,
    estimatedArrival: new Date(Date.now() + 5 * 60000).toISOString(),
    createTime: new Date(Date.now() - 18 * 60000).toISOString(),
    startTime: new Date(Date.now() - 17 * 60000).toISOString(),
    currentBattery: 65,
    currentLat: baseLat - 0.008,
    currentLng: baseLng - 0.03,
    progress: 75,
  },
  {
    id: 't3',
    taskNo: 'TASK20260606003',
    orderId: 'o3',
    droneId: 'd5',
    route: generateRoute(stations[5], orders[2].receiver.lat, orders[2].receiver.lng),
    status: 'flying',
    estimatedDuration: 25,
    estimatedArrival: new Date(Date.now() + 12 * 60000).toISOString(),
    createTime: new Date(Date.now() - 15 * 60000).toISOString(),
    startTime: new Date(Date.now() - 13 * 60000).toISOString(),
    currentBattery: 82,
    currentLat: baseLat + 0.05,
    currentLng: baseLng - 0.015,
    progress: 48,
  },
  {
    id: 't4',
    taskNo: 'TASK20260606004',
    orderId: 'o4',
    droneId: 'd8',
    route: generateRoute(stations[2], orders[3].receiver.lat, orders[3].receiver.lng),
    status: 'flying',
    estimatedDuration: 15,
    estimatedArrival: new Date(Date.now() + 3 * 60000).toISOString(),
    createTime: new Date(Date.now() - 13 * 60000).toISOString(),
    startTime: new Date(Date.now() - 12 * 60000).toISOString(),
    currentBattery: 55,
    currentLat: baseLat + 0.005,
    currentLng: baseLng - 0.008,
    progress: 82,
  },
  {
    id: 't5',
    taskNo: 'TASK20260606005',
    orderId: 'o8',
    droneId: 'd3',
    route: generateRoute(stations[0], orders[7].receiver.lat, orders[7].receiver.lng),
    status: 'queued',
    estimatedDuration: 20,
    estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString(),
    createTime: new Date(Date.now() - 5 * 60000).toISOString(),
    currentBattery: 100,
    currentLat: stations[0].lat,
    currentLng: stations[0].lng,
    progress: 0,
  },
  {
    id: 't6',
    taskNo: 'TASK20260606006',
    orderId: 'o9',
    droneId: 'd6',
    route: generateRoute(stations[0], orders[8].receiver.lat, orders[8].receiver.lng),
    status: 'ready',
    estimatedDuration: 16,
    estimatedArrival: new Date(Date.now() + 20 * 60000).toISOString(),
    createTime: new Date(Date.now() - 8 * 60000).toISOString(),
    currentBattery: 95,
    currentLat: stations[0].lat,
    currentLng: stations[0].lng,
    progress: 0,
  },
];

export const reviews: Review[] = [
  { id: 'r1', orderId: 'o6', customerName: '张三', rating: 5, comment: '配送速度很快，包装完好，非常满意！', createTime: '2026-06-06T09:30:00Z' },
  { id: 'r2', orderId: 'o7', customerName: '李四', rating: 4, comment: '总体不错，就是到达时电话通知稍微晚了点。', createTime: '2026-06-06T10:15:00Z' },
  { id: 'r3', orderId: 'o15', customerName: '王五', rating: 5, comment: '无人机配送太酷了，准时到达，体验很好！', createTime: '2026-06-06T08:45:00Z' },
  { id: 'r4', orderId: 'o16', customerName: '赵六', rating: 3, comment: '速度还可以，希望以后能有更多站点覆盖。', createTime: '2026-06-06T11:20:00Z' },
  { id: 'r5', orderId: 'o18', customerName: '陈七', rating: 5, comment: '生鲜食品冷链配送，收到时还很新鲜，点赞！', createTime: '2026-06-06T07:50:00Z' },
];

export const compensations: Compensation[] = [
  { id: 'c1', orderId: 'o17', amount: 50, reason: '配送途中遇到恶劣天气，导致包裹延迟送达', status: 'pending', createTime: '2026-06-06T10:00:00Z' },
  { id: 'c2', orderId: 'o20', amount: 30, reason: '包裹外包装轻微磨损，客户申请补偿', status: 'approved', createTime: '2026-06-05T16:30:00Z', handler: '李调度', handleTime: '2026-06-05T17:00:00Z' },
];

export const noFlyZones: NoFlyZone[] = [
  {
    id: 'nfz1',
    name: '虹桥机场禁飞区',
    type: 'airport',
    coordinates: [
      { lat: baseLat - 0.01, lng: baseLng - 0.04 },
      { lat: baseLat - 0.015, lng: baseLng - 0.035 },
      { lat: baseLat - 0.005, lng: baseLng - 0.045 },
    ],
    radius: 3000,
  },
  {
    id: 'nfz2',
    name: '人民广场管制区',
    type: 'government',
    coordinates: [
      { lat: baseLat + 0.005, lng: baseLng - 0.005 },
      { lat: baseLat + 0.008, lng: baseLng - 0.002 },
      { lat: baseLat + 0.002, lng: baseLng - 0.008 },
    ],
    radius: 1500,
  },
  {
    id: 'nfz3',
    name: '陆家嘴临时管制',
    type: 'temporary',
    coordinates: [
      { lat: baseLat + 0.02, lng: baseLng + 0.03 },
      { lat: baseLat + 0.025, lng: baseLng + 0.035 },
      { lat: baseLat + 0.015, lng: baseLng + 0.025 },
    ],
    radius: 1000,
  },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    orderId: 'o1',
    type: 'takeoff',
    title: '无人机已起飞',
    content: '您的包裹已从浦东中枢站起飞，预计 10 分钟后送达',
    sendTime: new Date(Date.now() - 10 * 60000).toISOString(),
    sender: '系统',
    read: true,
  },
  {
    id: 'n2',
    orderId: 'o5',
    type: 'arrival',
    title: '包裹已送达',
    content: '您的包裹已送达目的地，请及时查收',
    sendTime: new Date(Date.now() - 30 * 60000).toISOString(),
    sender: '系统',
    read: true,
  },
];

export const shifts: Shift[] = [
  {
    id: 'sh1',
    name: '早班',
    startTime: '06:00',
    endTime: '14:00',
    status: 'active',
    manager: '张调度',
    stationIds: ['s1', 's2', 's3'],
    droneIds: ['d1', 'd2', 'd3', 'd5', 'd8'],
    droneCount: 5,
    taskIds: ['t1', 't2', 't3', 't4', 't5', 't6'],
  },
  {
    id: 'sh2',
    name: '中班',
    startTime: '14:00',
    endTime: '22:00',
    status: 'upcoming',
    manager: '李调度',
    stationIds: ['s1', 's2', 's5', 's6'],
    droneIds: ['d4', 'd6', 'd9'],
    droneCount: 3,
    taskIds: [],
  },
  {
    id: 'sh3',
    name: '晚班',
    startTime: '22:00',
    endTime: '06:00',
    status: 'upcoming',
    manager: '王调度',
    stationIds: ['s1', 's6'],
    droneIds: ['d3', 'd6'],
    droneCount: 2,
    taskIds: [],
  },
];

export const weatherData: WeatherData = {
  temperature: 26,
  windSpeed: 3.2,
  windDirection: 135,
  humidity: 65,
  weather: 'sunny',
  visibility: 10000,
};

export const dailyStats = {
  todayOrders: 156,
  completedOrders: 128,
  flyingDrones: 4,
  activeStations: 5,
  onTimeRate: 94.5,
  avgDeliveryTime: 18.5,
  customerSatisfaction: 4.7,
  todayRevenue: 12580,
};

export const trendData = {
  orders: [120, 135, 142, 128, 156, 148, 162],
  revenue: [9800, 11200, 10500, 12300, 12580, 11800, 14200],
  dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
};
