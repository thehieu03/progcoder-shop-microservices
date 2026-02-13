/**
 * Inventory Service
 * Handles inventory operations
 */

import { api } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { CreateInventoryItemRequest, UpdateInventoryItemRequest } from "@/types/inventory";

export const inventoryService = {
  // Inventory Items
  getInventoryItems: (pageIndex = 1, pageSize = 10) =>
    api.get(API_ENDPOINTS.INVENTORY.GET_LIST, {
      params: { pageIndex, pageSize },
    }),

  getAllInventoryItems: () => api.get(API_ENDPOINTS.INVENTORY.GET_ALL),

  getInventoryItemById: (id: string) =>
    api.get(API_ENDPOINTS.INVENTORY.GET_DETAIL(id)),

  createInventoryItem: (data: CreateInventoryItemRequest) =>
    api.post(API_ENDPOINTS.INVENTORY.CREATE, data),

  updateInventoryItem: (id: string, data: UpdateInventoryItemRequest) =>
    api.put(API_ENDPOINTS.INVENTORY.UPDATE(id), data),

  deleteInventoryItem: (id: string) =>
    api.delete(API_ENDPOINTS.INVENTORY.DELETE(id)),

  increaseStock: (id: string, quantity: number) =>
    api.put(API_ENDPOINTS.INVENTORY.INCREASE_STOCK(id), { quantity }),

  decreaseStock: (id: string, quantity: number) =>
    api.put(API_ENDPOINTS.INVENTORY.DECREASE_STOCK(id), { quantity }),

  // Locations
  getLocations: () => api.get(API_ENDPOINTS.INVENTORY.GET_LOCATIONS),

  getLocationById: (id: string) =>
    api.get(API_ENDPOINTS.INVENTORY.GET_LOCATION(id)),

  createLocation: (data: { name: string; code: string; address?: string }) =>
    api.post(API_ENDPOINTS.INVENTORY.CREATE_LOCATION, data),

  updateLocation: (id: string, data: { name?: string; address?: string }) =>
    api.put(API_ENDPOINTS.INVENTORY.UPDATE_LOCATION(id), data),

  deleteLocation: (id: string) =>
    api.delete(API_ENDPOINTS.INVENTORY.DELETE_LOCATION(id)),

  // Histories
  getHistories: () => api.get(API_ENDPOINTS.INVENTORY.GET_HISTORIES),

  // Reservations
  getAllReservations: () => api.get(API_ENDPOINTS.INVENTORY.GET_ALL_RESERVATIONS),
};

export default inventoryService;
