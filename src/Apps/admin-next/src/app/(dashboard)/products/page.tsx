'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store';
import { fetchProducts, removeProductOptimistic } from '@/features/products/productSlice';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (isLoading) return <div className="p-8 text-center">Loading products...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products Management (Mock Data)</h1>
      
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-semibold">Product Name</th>
              <th className="p-4 font-semibold">SKU</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-gray-500">{product.sku}</td>
                <td className="p-4">${product.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${product.status === 'active' ? 'bg-green-100 text-green-800' : 
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {product.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => dispatch(removeProductOptimistic(product.id))}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="p-8 text-center text-gray-500">No products found.</div>
        )}
      </div>
    </div>
  );
}
