export interface RevenueDataPoint {
  date: string;
  dayName: string;
  totalRevenue: number;
  ordersCount: number;
}

export interface StatusDistributionPoint {
  status: string;
  statusArabic: string;
  count: number;
  color: string;
}

export interface AnalyticsResponse {
  totalRevenue: number;
  totalOrders: number;
  dailyData: RevenueDataPoint[];
  statusDistribution: StatusDistributionPoint[];
}

export interface StaffSummary {
  totalOrders: number;
  newOrders: number;
  preparingOrders: number;
  readyOrders: number;
  cancelledOrders?: number;
  totalRevenue: number;
  todayRevenue: number;
  revenueHistory: RevenueDataPoint[];
}
