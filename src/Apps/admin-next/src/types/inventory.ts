/**
 * Inventory Service Type Definitions
 */

import { Guid, AuditableDto, PaginatedResponse, FilterParams } from './api';

// ==================== Inventory Item Types ====================

export enum StockStatus {
  InStock = 0,
  LowStock = 1,
  OutOfStock = 2,
}

export interface InventoryItemDto extends AuditableDto {
  id: Guid;
  productId: Guid;
  productName?: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  locationId?: Guid;
  locationName?: string;
  status: StockStatus;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface CreateInventoryItemRequest {
  productId: Guid;
  sku: string;
  quantity: number;
  locationId?: Guid;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface UpdateInventoryItemRequest extends CreateInventoryItemRequest {}

export interface IncreaseStockRequest {
  quantity: number;
  reason?: string;
}

export interface DecreaseStockRequest {
  quantity: number;
  reason?: string;
}

export interface GetInventoryItemsParams extends FilterParams {
  productId?: Guid;
  sku?: string;
  locationId?: Guid;
  status?: StockStatus;
}

export interface GetAllInventoryItemsResponse {
  items: InventoryItemDto[];
}

export interface GetInventoryItemsResponse extends PaginatedResponse<InventoryItemDto> {}

// ==================== Location Types ====================

export interface LocationDto extends AuditableDto {
  id: Guid;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  active: boolean;
}

export interface CreateLocationRequest {
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateLocationRequest extends CreateLocationRequest {}

export interface GetAllLocationsResponse {
  locations: LocationDto[];
}

// ==================== History Types ====================

export enum InventoryChangeType {
  Increase = 0,
  Decrease = 1,
  Reserve = 2,
  Release = 3,
}

export interface InventoryHistoryDto extends AuditableDto {
  id: Guid;
  inventoryItemId: Guid;
  productName?: string;
  sku: string;
  changeType: InventoryChangeType;
  quantityBefore: number;
  quantityAfter: number;
  quantityChanged: number;
  reason?: string;
  referenceId?: Guid;
  referenceType?: string;
}

export interface GetAllHistoriesResponse {
  histories: InventoryHistoryDto[];
}

// ==================== Reservation Types ====================

export interface InventoryReservationDto extends AuditableDto {
  id: Guid;
  inventoryItemId: Guid;
  productName?: string;
  sku: string;
  quantity: number;
  orderId?: Guid;
  expiresAt: string;
  isReleased: boolean;
}

export interface GetAllReservationsResponse {
  reservations: InventoryReservationDto[];
}
