import { CategoryDto } from "@/shared/types/catalog";
import { Guid } from "@/shared/types/api";

export const mockCategories: CategoryDto[] = [
  {
    id: "c1d2e3f4-g5h6-7i8j-9k0l-m1n2o3p4q5r6" as Guid,
    name: "Smartphone",
    slug: "smartphone",
    description: "Mobile phones and accessories",
    createdOnUtc: new Date().toISOString(),
  },
  {
    id: "l1k2j3i4-h5g6-f7e8-d9c0-b1a293847566" as Guid,
    name: "Laptop",
    slug: "laptop",
    description: "Notebooks and ultrabooks",
    createdOnUtc: new Date().toISOString(),
  },
  {
    id: "t1y2u3i4-o5p6-a7s8-d9f0-g1h2j3k4l5z6" as Guid,
    name: "Tablet",
    slug: "tablet",
    createdOnUtc: new Date().toISOString(),
  },
];

export const mockGetAllCategoriesResponse = {
  categories: mockCategories,
};

export const mockGetCategoryTreeResponse = {
  categories: [
    {
      id: "c1d2e3f4-g5h6-7i8j-9k0l-m1n2o3p4q5r6" as Guid,
      name: "Smartphone",
      slug: "smartphone",
      children: [],
    },
    {
      id: "l1k2j3i4-h5g6-f7e8-d9c0-b1a293847566" as Guid,
      name: "Laptop",
      slug: "laptop",
      children: [],
    },
  ],
};
