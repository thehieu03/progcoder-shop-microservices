export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  category: string;
  imageUrl: string;
  createdAt: string;
}
