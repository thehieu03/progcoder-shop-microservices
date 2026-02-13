import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/shared/types/product';
import { productService } from '@/core/services/productService';

interface ProductState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async Thunk để gọi Service (Mock)
export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  const data = await productService.getProducts();
  return data;
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Reducer xử lý đồng bộ (ví dụ xóa item khỏi list ngay lập tức)
    removeProductOptimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const { removeProductOptimistic } = productSlice.actions;
export default productSlice.reducer;
