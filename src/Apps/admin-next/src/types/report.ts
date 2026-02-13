/**
 * Report Service Type Definitions
 */

// ==================== Dashboard Statistics ====================

export interface DashboardStatisticsDto {
  growth?: number;
  productsSold?: number;
  totalRevenue?: number;
  totalUsers?: number;
  // Add other statistics fields as needed
}

export interface OrderGrowthDataPoint {
  date: string;
  count: number;
  revenue?: number;
}

export interface OrderGrowthStatisticsDto {
  data: OrderGrowthDataPoint[];
}

export interface TopProductDataPoint {
  productId: string;
  productName: string;
  quantity: number;
  revenue?: number;
}

export interface TopProductStatisticsDto {
  data: TopProductDataPoint[];
}
