# Day 04: UI Components

## Mục tiêu

Xây dựng các UI Components cơ bản và tái sử dụng:
- Icon component với Iconify
- Button component (208 lines) với đầy đủ variants
- Card component với header và body
- TextInput component với validation support

## 1. Icon Component - `src/components/ui/Icon.tsx`

```typescript
import React from "react";
import { Icon as IconifyIcon } from "@iconify/react";

interface IconProps {
  icon: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
}

const Icon: React.FC<IconProps> = ({ 
  icon, 
  className, 
  width = 20, 
  height,
  rotate, 
  hFlip, 
  vFlip 
}) => {
  return (
    <IconifyIcon
      icon={icon}
      width={width}
      height={height}
      rotate={rotate}
      hFlip={hFlip}
      vFlip={vFlip}
      className={className}
    />
  );
};

export default Icon;
```

**Giải thích:**
- Wrapper cho `@iconify/react` - thư viện icon lớn nhất
- Props đầy đủ: rotate, flip, custom size
- Default width = 20px cho consistency

## 2. Button Component - `src/components/ui/Button.tsx` (208 lines)

```typescript
import React from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface ButtonProps {
  text?: string;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: string;
  loadingClass?: string;
  iconPosition?: "left" | "right";
  iconClass?: string;
  link?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
  div?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  type = "button",
  isLoading,
  disabled,
  className = "bg-primary-500 text-white",
  children,
  icon,
  loadingClass = "unset-classname",
  iconPosition = "left",
  iconClass = "text-[20px]",
  link,
  onClick,
  div,
}) => {
  return (
    <>
      {/* Standard Button */}
      {!link && !div && (
        <button
          type={type}
          onClick={onClick}
          className={`btn inline-flex justify-center ${
            isLoading ? "pointer-events-none" : ""
          } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
        >
          {/* Render children if provided and not loading */}
          {children && !isLoading && children}

          {/* Render icon + text if no children and not loading */}
          {!children && !isLoading && (
            <span className="flex items-center">
              {icon && (
                <span
                  className={`
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                    ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                    ${iconClass}
                  `}
                >
                  <Icon icon={icon} />
                </span>
              )}
              <span>{text}</span>
            </span>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <>
              <svg
                className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${loadingClass}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading ...
            </>
          )}
        </button>
      )}

      {/* Div Button (for custom click handlers) */}
      {!link && div && (
        <div
          onClick={onClick}
          className={`btn inline-flex justify-center cursor-pointer ${
            isLoading ? "pointer-events-none" : ""
          } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
        >
          {children && !isLoading && children}
          {!children && !isLoading && (
            <span className="flex items-center">
              {icon && (
                <span
                  className={`
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                    ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                    ${iconClass}
                  `}
                >
                  <Icon icon={icon} />
                </span>
              )}
              <span>{text}</span>
            </span>
          )}
          {isLoading && (
            <>
              <svg
                className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${loadingClass}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading ...
            </>
          )}
        </div>
      )}

      {/* Link Button */}
      {link && !div && (
        <Link
          href={link}
          className={`btn inline-flex justify-center ${
            isLoading ? "pointer-events-none" : ""
          } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
        >
          {children && !isLoading && children}
          {!children && !isLoading && (
            <span className="flex items-center">
              {icon && (
                <span
                  className={`
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                    ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                    ${iconClass}
                  `}
                >
                  <Icon icon={icon} />
                </span>
              )}
              <span>{text}</span>
            </span>
          )}
          {isLoading && (
            <>
              <svg
                className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${loadingClass}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading ...
            </>
          )}
        </Link>
      )}
    </>
  );
};

export default Button;
```

**Giải thích:**
- 3 variants: `<button>`, `<div>` (clickable), `<Link>`
- Loading state với SVG spinner animation
- Icon support với left/right positioning
- RTL (Right-to-Left) support cho Arabic/Hebrew
- `className` prop cho flexible styling

## 3. Card Component - `src/components/ui/Card.tsx`

```typescript
"use client";
import React from "react";
import useSkin from "@/hooks/useSkin";

interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerSlot?: React.ReactNode;
  className?: string;
  bodyClass?: string;
  noBorder?: boolean;
  titleClass?: string;
  [key: string]: any;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerSlot,
  className = "",
  bodyClass = "p-6",
  noBorder,
  titleClass = "text-slate-900 dark:text-white",
  ...props
}) => {
  const [skin] = useSkin();

  return (
    <div
      {...props}
      className={`
        card rounded-md bg-white dark:bg-slate-800 
        ${skin === "bordered"
          ? "border border-slate-200 dark:border-slate-700"
          : "shadow-base"
        } 
        ${className}
      `}
    >
      {/* Header với title và subtitle */}
      {(title || subtitle) && (
        <header className={`card-header ${noBorder ? "no-border" : ""}`}>
          <div>
            {title && <div className={`card-title ${titleClass}`}>{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerSlot && <div className="card-header-slot">{headerSlot}</div>}
        </header>
      )}
      
      {/* Body content */}
      <main className={`card-body ${bodyClass}`}>{children}</main>
    </div>
  );
};

export default Card;
```

**Giải thích:**
- `useSkin` hook để detect bordered/default skin
- Header optional với title, subtitle, và headerSlot
- Dark mode support với `dark:` classes
- Flexible bodyClass để customize padding

## 4. TextInput Component - `src/components/ui/TextInput.tsx` (183 lines)

```typescript
"use client";
import React, { useState, ChangeEvent, FocusEvent } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface TextinputProps<TFieldValues extends FieldValues = FieldValues> {
  type?: string;
  label?: string;
  placeholder?: string;
  classLabel?: string;
  className?: string;
  classGroup?: string;
  register?: UseFormRegister<TFieldValues>;
  name?: Path<TFieldValues>;
  readonly?: boolean;
  value?: string | number;
  error?: { message?: string };
  icon?: string;
  disabled?: boolean;
  id?: string;
  horizontal?: boolean;
  validate?: string;
  isMask?: boolean;
  msgTooltip?: boolean;
  description?: string;
  hasicon?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  options?: Record<string, unknown>;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  defaultValue?: string | number;
}

const Textinput = <TFieldValues extends FieldValues = FieldValues>({
  type = "text",
  label,
  placeholder = "Add placeholder",
  classLabel = "form-label",
  className = "",
  classGroup = "",
  register,
  name,
  readonly,
  value,
  error,
  icon,
  disabled,
  id,
  horizontal,
  validate,
  isMask,
  msgTooltip,
  description,
  hasicon,
  onChange,
  onBlur,
  options,
  onFocus,
  defaultValue,
  ...rest
}: TextinputProps<TFieldValues>) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(!open);
  };

  return (
    <div
      className={`fromGroup ${error ? "has-error" : ""} ${
        horizontal ? "flex" : ""
      } ${validate ? "is-valid" : ""}`}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel} ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label}
        </label>
      )}

      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {/* Standard Input */}
        {!isMask && (
          <input
            type={type === "password" && open ? "text" : type}
            {...(register && name ? register(name) : {})}
            {...rest}
            name={name}
            className={`${error ? "has-error" : ""} form-control py-2 ${className}`}
            placeholder={placeholder}
            readOnly={readonly}
            defaultValue={defaultValue}
            disabled={disabled}
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}

        {/* Masked Input (Cleave.js) */}
        {isMask && (
          <Cleave
            {...(register && name ? register(name) : {})}
            {...rest}
            name={name}
            placeholder={placeholder}
            options={options}
            className={`${error ? "has-error" : ""} form-control py-2 ${className}`}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}

        {/* Icons (password toggle, error, success) */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
          {/* Password visibility toggle */}
          {hasicon && (
            <span
              className="cursor-pointer text-secondary-500"
              onClick={handleOpen}
            >
              {open && type === "password" && (
                <Icon icon="heroicons-outline:eye" />
              )}
              {!open && type === "password" && (
                <Icon icon="heroicons-outline:eye-off" />
              )}
            </span>
          )}

          {/* Error icon */}
          {error && (
            <span className="text-danger-500">
              <Icon icon="heroicons-outline:information-circle" />
            </span>
          )}

          {/* Success/Validate icon */}
          {validate && (
            <span className="text-success-500">
              <Icon icon="bi:check-lg" />
            </span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={`mt-2 ${
            msgTooltip
              ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded-sm"
              : "text-danger-500 block text-sm"
          }`}
        >
          {error.message}
        </div>
      )}

      {/* Success message */}
      {validate && (
        <div
          className={`mt-2 ${
            msgTooltip
              ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded-sm"
              : "text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}

      {/* Description text */}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Textinput;
```

**Giải thích:**
- Generic type support cho `react-hook-form`
- Password visibility toggle với eye/eye-off icons
- Masked input với Cleave.js cho số điện thoại, credit card
- Error và validate states với icons
- Horizontal layout option cho form labels

## CSS Classes cần thiết - `src/assets/css/app.css`

```css
/* Button Base */
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600;
}

.btn-dark {
  @apply bg-slate-800 text-white hover:bg-slate-900;
}

.btn-outline-dark {
  @apply border border-slate-300 text-slate-700 hover:bg-slate-50;
}

.btn-danger {
  @apply bg-danger-500 text-white hover:bg-danger-600;
}

.btn-success {
  @apply bg-success-500 text-white hover:bg-success-600;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

/* Card */
.card {
  @apply rounded-lg;
}

.card-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700;
}

.card-title {
  @apply text-lg font-semibold;
}

.card-subtitle {
  @apply text-sm text-slate-500 dark:text-slate-400 mt-1;
}

/* Form Control */
.form-control {
  @apply w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white;
}

.form-control.has-error {
  @apply border-danger-500 focus:ring-danger-500;
}

.form-label {
  @apply text-sm font-medium text-slate-700 dark:text-slate-300 mb-1;
}

/* Action Button (cho tables) */
.action-btn {
  @apply p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors;
}
```

## Checklist cuối ngày

- [ ] Icon component render đúng các icon
- [ ] Button với 3 variants hoạt động (button, div, link)
- [ ] Button loading state hiển thị spinner
- [ ] Card với skin bordered/default
- [ ] TextInput hỗ trợ react-hook-form
- [ ] TextInput password toggle hoạt động
- [ ] CSS classes đầy đủ cho tất cả components

## Liên kết

- [Day 03: Redux Store Core](./day-03.md) - Trước đó: Redux setup
- [Day 05: Hooks](./day-05.md) - Tiếp theo: Custom hooks
- [Iconify Documentation](https://iconify.design/docs/)
