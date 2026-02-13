/**
 * Report Service
 * Mock service functions for dashboard reports and statistics
 */

import {
  DashboardStatisticsDto,
  OrderGrowthStatisticsDto,
  TopProductStatisticsDto,
} from '@/shared/types';
import {
  mockDashboardStatistics,
  mockOrderGrowthStatistics,
  mockTopProductStatistics,
} from '@/mock/services/report.mock';

export const reportService = {
  /**
   * Fetch dashboard statistics (Growth, Products Sold, Total Revenue, Total Users)
   */
  getDashboardStatistics: async (): Promise<DashboardStatisticsDto> => {
    return mockDashboardStatistics;
  },

  /**
   * Fetch order growth statistics for line chart
   */
  getOrderGrowthStatistics: async (): Promise<OrderGrowthStatisticsDto> => {
    return mockOrderGrowthStatistics;
  },

  /**
   * Fetch top products statistics for pie chart
   */
  getTopProductStatistics: async (): Promise<TopProductStatisticsDto> => {
    return mockTopProductStatistics;
  },
};

export default reportService;
