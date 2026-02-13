/**
 * Report Service
 * Handles dashboard statistics and reports
 */

import { api } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";

export const reportService = {
  // Dashboard Statistics
  getDashboardStatistics: () =>
    api.get(API_ENDPOINTS.REPORT.DASHBOARD_STATISTICS),

  getOrderGrowthStatistics: () =>
    api.get(API_ENDPOINTS.REPORT.ORDER_GROWTH_LINE_CHART),

  getTopProductStatistics: () =>
    api.get(API_ENDPOINTS.REPORT.TOP_PRODUCT_PIE_CHART),
};

export default reportService;
