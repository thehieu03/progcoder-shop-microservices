import { ProductDto, ProductStatus } from "@/shared/types/catalog";
import { Guid } from "@/shared/types/api";

const mockProducts: ProductDto[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" as Guid,
    name: "iPhone 15 Pro Max",
    sku: "IP15PM-256-NAT",
    slug: "iphone-15-pro-max",
    shortDescription: "Titanium design, A17 Pro chip.",
    price: 1199,
    salePrice: 1099,
    published: true,
    featured: true,
    status: ProductStatus.InStock,
    displayStatus: "In Stock",
    thumbnail: {
      publicURL: "https://placehold.co/600x400/png?text=iPhone+15",
    },
    images: [],
    categoryIds: [],
    brandId: "b1d0c4e2-8976-4b3c-9a1d-2e3f4g5h6i7j" as Guid,
    colors: ["Natural Titanium", "Blue Titanium"],
    created: new Date(),
  },
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef" as Guid,
    name: "MacBook Pro M3",
    sku: "MBP14-M3-512",
    slug: "macbook-pro-m3",
    shortDescription: "Space Black, M3 Pro chip.",
    price: 1999,
    published: true,
    featured: false,
    status: ProductStatus.InStock,
    displayStatus: "In Stock",
    thumbnail: {
      publicURL: "https://placehold.co/600x400/png?text=MacBook+Pro",
    },
    images: [],
    categoryIds: [],
    created: new Date(),
  },
  {
    id: "c9d8e7f6-5432-1098-7654-321098765432" as Guid,
    name: "Samsung Galaxy S24 Ultra",
    sku: "S24U-512-GRY",
    slug: "galaxy-s24-ultra",
    shortDescription: "AI Phone with S Pen.",
    price: 1299,
    salePrice: 1199,
    published: false,
    featured: true,
    status: ProductStatus.OutOfStock,
    displayStatus: "Out of Stock",
    thumbnail: {
      publicURL: "https://placehold.co/600x400/png?text=S24+Ultra",
    },
    images: [],
    categoryIds: [],
    created: new Date(),
  },
];

export const mockGetAllProductsResponse = {
  result: {
    items: mockProducts,
  },
};

export const mockGetProductsResponse = {
  result: {
    items: mockProducts,
    pageIndex: 1,
    totalPages: 1,
    totalCount: mockProducts.length,
    hasPreviousPage: false,
    hasNextPage: false,
  },
};
