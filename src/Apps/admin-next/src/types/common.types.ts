/**
 * Common Utility Types
 * Shared types used across the application
 */

import { ReactNode } from 'react';

// ==================== React Component Types ====================

export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}

export interface PageProps<T = any> {
  params?: T;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// ==================== Layout Types ====================

export type ThemeMode = 'light' | 'dark';
export type SkinMode = 'default' | 'bordered';
export type ContentWidth = 'full' | 'boxed';
export type MenuLayout = 'vertical' | 'horizontal';
export type NavbarType = 'sticky' | 'floating' | 'static' | 'hidden';
export type FooterType = 'sticky' | 'static' | 'hidden';
export type Direction = 'ltr' | 'rtl';

export interface LayoutConfig {
  isRtl: boolean;
  isDark: boolean;
  skin: SkinMode;
  contentWidth: ContentWidth;
  sidebarCollapsed: boolean;
  menuLayout: MenuLayout;
  navbarType: NavbarType;
  footerType: FooterType;
  menuHidden: boolean;
  isMonochrome: boolean;
  isSemiDark: boolean;
  mobileMenu: boolean;
}

// ==================== Form Types ====================

export interface FormFieldError {
  message?: string;
}

export interface FormErrors {
  [key: string]: FormFieldError | undefined;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// ==================== Table Types ====================

export interface TableColumn<T = any> {
  Header: string;
  accessor: keyof T | string;
  Cell?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
}

// ==================== Status Types ====================

export type Status = 'pending' | 'active' | 'inactive' | 'completed' | 'cancelled';

export interface StatusOption {
  value: Status;
  label: string;
  color: string;
}

// ==================== Date/Time Types ====================

export type DateString = string; // ISO 8601 format
export type TimeString = string; // HH:mm:ss format

// ==================== ID Types ====================

export type ID = string | number;

// ==================== Loading State ====================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ==================== Action Types ====================

export interface ActionMeta {
  loading?: boolean;
  error?: string;
}

// ==================== Route Types ====================

export interface Route {
  path: string;
  name: string;
  icon?: string;
  component?: any;
  children?: Route[];
}

// ==================== Utility Types ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ==================== Event Handler Types ====================

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
