/**
 * Catalog Service Type Definitions
 */

import { Guid, AuditableDto, PaginatedResponse, FilterParams } from "./api";

// ==================== Product Types ====================

export enum ProductStatus {
  InStock = 1,
  OutOfStock = 2,
}

export interface ProductImageDto {
  fileId?: string;
  originalFileName?: string;
  fileName?: string;
  publicURL?: string;
}

export interface ProductDto extends AuditableDto {
  id: Guid;
  name: string;
  sku: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  price: number;
  salePrice?: number;
  categoryIds?: Guid[];
  brandId?: Guid;
  images?: ProductImageDto[];
  thumbnail?: ProductImageDto;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  published: boolean;
  featured: boolean;
  status: ProductStatus;
  displayStatus?: string;
  seoTitle?: string;
  seoDescription?: string;
  barcode?: string;
  unit?: string;
  weight?: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  salePrice?: number;
  categoryIds?: Guid[];
  brandId?: Guid;
  imageFiles?: File[];
  thumbnailFile?: File;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  barcode?: string;
  unit?: string;
  weight?: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
  keepImageUrls?: string[];
  keepThumbnailUrl?: string;
}

export interface GetProductsParams extends FilterParams {
  name?: string;
  sku?: string;
  categoryIds?: Guid[];
  brandId?: Guid;
  minPrice?: number;
  maxPrice?: number;
  published?: boolean;
  featured?: boolean;
  status?: ProductStatus;
}

export interface GetAllProductsResponse {
  result: {
    items: ProductDto[];
  };
}

export interface GetProductsResponse extends PaginatedResponse<ProductDto> {}

export interface GetProductByIdResponse {
  product: ProductDto;
}

// ==================== Category Types ====================

export interface CategoryDto extends AuditableDto {
  id: Guid;
  name: string;
  slug: string;
  description?: string;
  parentId?: Guid;
}

export interface CategoryTreeItemDto {
  id: Guid;
  name: string;
  slug: string;
  description?: string;
  parentId?: Guid;
  children?: CategoryTreeItemDto[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: Guid;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  parentId?: Guid;
}

export interface GetAllCategoriesResponse {
  categories: CategoryDto[];
}

export interface GetCategoryTreeResponse {
  categories: CategoryTreeItemDto[];
}

// ==================== Brand Types ====================

export interface BrandDto extends AuditableDto {
  id: Guid;
  name: string;
  slug: string;
}

export interface CreateBrandRequest {
  name: string;
}

export interface UpdateBrandRequest {
  name: string;
}

export interface GetAllBrandsResponse {
  brands: BrandDto[];
}
