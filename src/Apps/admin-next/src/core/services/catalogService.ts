/**
 * Catalog Service
 * Handles product, category, and brand operations
 */

import { api } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BrandDto,
  CreateBrandRequest,
  UpdateBrandRequest,
} from "@/types/catalog";

export const catalogService = {
  // Products
  getProducts: (pageIndex = 1, pageSize = 10) =>
    api.get(API_ENDPOINTS.CATALOG.GET_PRODUCTS, {
      params: { pageIndex, pageSize },
    }),

  getAllProducts: () => api.get(API_ENDPOINTS.CATALOG.GET_ALL_PRODUCTS),

  getProductById: (id: string) =>
    api.get(API_ENDPOINTS.CATALOG.GET_PRODUCT_DETAIL(id)),

  createProduct: (data: CreateProductRequest) =>
    api.post(API_ENDPOINTS.CATALOG.CREATE_PRODUCT, data),

  updateProduct: (id: string, data: UpdateProductRequest) =>
    api.put(API_ENDPOINTS.CATALOG.UPDATE_PRODUCT(id), data),

  deleteProduct: (id: string) =>
    api.delete(API_ENDPOINTS.CATALOG.DELETE_PRODUCT(id)),

  publishProduct: (id: string) =>
    api.post(API_ENDPOINTS.CATALOG.PUBLISH_PRODUCT(id)),

  unpublishProduct: (id: string) =>
    api.post(API_ENDPOINTS.CATALOG.UNPUBLISH_PRODUCT(id)),

  // Categories
  getCategories: () => api.get(API_ENDPOINTS.CATALOG.GET_CATEGORIES),

  getCategoryTree: () => api.get(API_ENDPOINTS.CATALOG.GET_CATEGORY_TREE),

  getCategoryById: (id: string) =>
    api.get(API_ENDPOINTS.CATALOG.GET_CATEGORY_DETAIL(id)),

  createCategory: (data: CreateCategoryRequest) =>
    api.post(API_ENDPOINTS.CATALOG.CREATE_CATEGORY, data),

  updateCategory: (id: string, data: UpdateCategoryRequest) =>
    api.put(API_ENDPOINTS.CATALOG.UPDATE_CATEGORY(id), data),

  deleteCategory: (id: string) =>
    api.delete(API_ENDPOINTS.CATALOG.DELETE_CATEGORY(id)),

  // Brands
  getBrands: (pageIndex = 1, pageSize = 10) =>
    api.get(API_ENDPOINTS.CATALOG.GET_BRANDS, {
      params: { pageIndex, pageSize },
    }),

  getBrandById: (id: string) =>
    api.get(API_ENDPOINTS.CATALOG.GET_BRAND_DETAIL(id)),

  createBrand: (data: CreateBrandRequest) =>
    api.post(API_ENDPOINTS.CATALOG.CREATE_BRAND, data),

  updateBrand: (id: string, data: UpdateBrandRequest) =>
    api.put(API_ENDPOINTS.CATALOG.UPDATE_BRAND(id), data),

  deleteBrand: (id: string) =>
    api.delete(API_ENDPOINTS.CATALOG.DELETE_BRAND(id)),
};

export default catalogService;
