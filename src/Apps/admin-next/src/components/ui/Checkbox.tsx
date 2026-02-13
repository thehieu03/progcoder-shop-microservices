"use client";

import React from "react";

interface CheckboxProps {
  label?: React.ReactNode;
  value?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  value = false,
  onChange,
  className = "",
  disabled = false,
  name,
  id,
}) => {
  const inputId = id || name;

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <input
        id={inputId}
        name={name}
        type="checkbox"
        checked={value}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
};

export default Checkbox;
