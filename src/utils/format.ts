export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
};

export const formatWeight = (kg: number): string => {
  return `${kg.toFixed(1)} kg`;
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} 小时 ${mins} 分钟`;
};

export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    weighted: '已称重',
    dispatched: '已派单',
    flying: '配送中',
    delivered: '已送达',
    signed: '已签收',
    exception: '异常',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

export const getTaskStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    queued: '排队中',
    ready: '准备起飞',
    flying: '飞行中',
    landing: '降落中',
    completed: '已完成',
    exception: '异常',
  };
  return statusMap[status] || status;
};

export const getDroneStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    idle: '空闲',
    charging: '充电中',
    flying: '飞行中',
    landing: '降落中',
    maintenance: '维护中',
    offline: '离线',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'bg-gray-500',
    weighted: 'bg-blue-500',
    dispatched: 'bg-indigo-500',
    flying: 'bg-green-500',
    delivered: 'bg-yellow-500',
    signed: 'bg-emerald-500',
    exception: 'bg-red-500',
    cancelled: 'bg-gray-600',
    queued: 'bg-amber-500',
    ready: 'bg-blue-500',
    completed: 'bg-emerald-500',
    idle: 'bg-gray-500',
    charging: 'bg-yellow-500',
    maintenance: 'bg-orange-500',
    offline: 'bg-gray-700',
    landing: 'bg-cyan-500',
  };
  return colorMap[status] || 'bg-gray-500';
};

export const getSizeText = (size: string): string => {
  const sizeMap: Record<string, string> = {
    small: '小件',
    medium: '中件',
    large: '大件',
  };
  return sizeMap[size] || size;
};
