/**
 * Inventory Service
 * Mock service functions for inventory management
 */

import { AxiosResponse } from 'axios';
import {
  Guid,
  GetAllInventoryItemsResponse,
  GetInventoryItemsResponse,
  GetInventoryItemsParams,
  IncreaseStockRequest,
  DecreaseStockRequest,
  GetAllLocationsResponse,
  GetAllHistoriesResponse,
  GetAllReservationsResponse,
} from '@/shared/types';
import {
  mockInventoryItems,
  mockLocations,
} from '@/mock/services/inventory.mock';

// Helper to create mock response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
});

export const inventoryService = {
  getAllInventoryItems: async (): Promise<AxiosResponse<GetAllInventoryItemsResponse>> => {
    return createMockResponse({ items: mockInventoryItems });
  },

  getInventoryItems: async (params: GetInventoryItemsParams = {}): Promise<AxiosResponse<GetInventoryItemsResponse>> => {
    const pageIndex = (params as any).pageIndex || 1;
    const pageSize = (params as any).pageSize || 10;
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    
    return createMockResponse({
      items: mockInventoryItems.slice(start, end),
      totalCount: mockInventoryItems.length,
      pageIndex,
      pageSize,
      totalPages: Math.ceil(mockInventoryItems.length / pageSize),
      hasPreviousPage: pageIndex > 1,
      hasNextPage: end < mockInventoryItems.length,
    });
  },

  getInventoryItemById: async (itemId: Guid): Promise<AxiosResponse<any>> => {
    const item = mockInventoryItems.find((i) => i.id === itemId);
    return createMockResponse({ item: item || mockInventoryItems[0] });
  },

  createInventoryItem: async (itemData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Inventory item created successfully" });
  },

  updateInventoryItem: async (itemId: Guid, itemData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Inventory item updated successfully" });
  },

  deleteInventoryItem: async (itemId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  increaseStock: async (itemId: Guid, stockData: IncreaseStockRequest): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  decreaseStock: async (itemId: Guid, stockData: DecreaseStockRequest): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  getLocations: async (): Promise<AxiosResponse<GetAllLocationsResponse>> => {
    return createMockResponse({ locations: mockLocations });
  },

  getLocationById: async (locationId: Guid): Promise<AxiosResponse<any>> => {
    const location = mockLocations.find((l) => l.id === locationId);
    return createMockResponse({ location: location || mockLocations[0] });
  },

  createLocation: async (locationData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Location created successfully" });
  },

  updateLocation: async (locationId: Guid, locationData: any): Promise<AxiosResponse<any>> => {
    return createMockResponse({ success: true, message: "Location updated successfully" });
  },

  deleteLocation: async (locationId: Guid): Promise<AxiosResponse<void>> => {
    return createMockResponse(undefined as any);
  },

  getHistories: async (): Promise<AxiosResponse<GetAllHistoriesResponse>> => {
    return createMockResponse({ histories: [] });
  },

  getAllReservations: async (): Promise<AxiosResponse<GetAllReservationsResponse>> => {
    return createMockResponse({ reservations: [] });
  },
};

export default inventoryService;
