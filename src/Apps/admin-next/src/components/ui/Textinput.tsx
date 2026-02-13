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
      className={`fromGroup  ${error ? "has-error" : ""}  ${
        horizontal ? "flex" : ""
      }  ${validate ? "is-valid" : ""} `}
    >
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel}  ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {!isMask && (
          <input
            type={type === "password" && open === true ? "text" : type}
            {...(register && name ? register(name) : {})}
            {...rest}
            name={name}
            className={`${
              error ? " has-error" : " "
            } form-control py-2 ${className}  `}
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
        {isMask && (
          <Cleave
            {...(register && name ? register(name) : {})}
            {...rest}
            name={name}
            placeholder={placeholder}
            options={options}
            className={`${
              error ? " has-error" : " "
            } form-control py-2 ${className}  `}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
        {/* icon */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2  space-x-1 rtl:space-x-reverse">
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

          {error && (
            <span className="text-danger-500">
              <Icon icon="heroicons-outline:information-circle" />
            </span>
          )}
          {validate && (
            <span className="text-success-500">
              <Icon icon="bi:check-lg" />
            </span>
          )}
        </div>
      </div>
      {/* error and success message*/}
      {error && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded-sm"
              : " text-danger-500 block text-sm"
          }`}
        >
          {error.message}
        </div>
      )}
      {/* validated and success message*/}
      {validate && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded-sm"
              : " text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}
      {/* only description */}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Textinput;
