/**
 * Redux Store Type Definitions
 */

import { ThunkAction, Action } from '@reduxjs/toolkit';
import type { store } from '@/store';

// ==================== Store Types ====================

// Infer RootState and AppDispatch from the actual store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// ==================== Slice State Types ====================

export interface SliceLoadingState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// ==================== RTK Query Types ====================

export interface QueryState<T> {
  data?: T;
  error?: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isFetching: boolean;
}

export interface MutationState<T> {
  data?: T;
  error?: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// ==================== Cart State Types ====================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  brand: string;
  quantity: number;
}

export interface ShopFilters {
  search: string;
  category: string;
  price: number;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  filters: ShopFilters;
}

// ==================== Layout State Types ====================

export interface LayoutState {
  isRTL: boolean;
  darkMode: boolean;
  isCollapsed: boolean;
  customizer: boolean;
  semiDarkMode: boolean;
  skin: 'default' | 'bordered';
  contentWidth: 'full' | 'boxed';
  type: 'vertical' | 'horizontal';
  menuHidden: boolean;
  navBarType: 'sticky' | 'floating' | 'static' | 'hidden';
  footerType: 'sticky' | 'static' | 'hidden';
  mobileMenu: boolean;
  isMonochrome: boolean;
}

// ==================== Calendar State Types ====================

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  color?: string;
  description?: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  loading: boolean;
  error: string | null;
}
