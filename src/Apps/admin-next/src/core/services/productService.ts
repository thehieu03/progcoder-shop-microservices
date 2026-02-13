import { MOCK_PRODUCTS } from '@/mocks/productsMock';
import { Product } from '@/shared/types/product';

// Giả lập độ trễ mạng (500ms)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    await delay(500); // Fake loading
    return MOCK_PRODUCTS;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    await delay(300);
    return MOCK_PRODUCTS.find(p => p.id === id);
  }
};
