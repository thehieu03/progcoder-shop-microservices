import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import productReducer from '@/features/products/productSlice';
import authReducer from '@/features/auth/authSlice';
import layoutReducer from '@/features/layout/layoutSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    layout: layoutReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Types cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks dùng trong Component (để không phải gõ type mỗi lần dùng)
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
