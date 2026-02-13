import { BrandDto } from "@/shared/types/catalog";
import { Guid } from "@/shared/types/api";

export const mockBrands: BrandDto[] = [
  {
    id: "b1d0c4e2-8976-4b3c-9a1d-2e3f4g5h6i7j" as Guid,
    name: "Apple",
    slug: "apple",
    createdOnUtc: new Date().toISOString(),
  },
  {
    id: "s2a3m4s5-6u7n-8g90-1234-567890abcdef" as Guid,
    name: "Samsung",
    slug: "samsung",
    createdOnUtc: new Date().toISOString(),
  },
  {
    id: "l3g4e5l6-g7s8-9h01-2345-678901abcdef" as Guid,
    name: "LG",
    slug: "lg",
    createdOnUtc: new Date().toISOString(),
  },
];

export const mockGetAllBrandsResponse = {
  brands: mockBrands,
};
