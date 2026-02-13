"use client";
import React, { ReactNode } from "react";

interface TooltipProps {
  children?: ReactNode;
  title?: string;
  content?: string;
  className?: string;
  placement?: string;
  arrow?: boolean;
  animation?: string;
  theme?: string;
}

// TEMPORARY: Pass-through component to fix "Maximum update depth exceeded" error
// The original Tooltip using Radix UI was causing infinite render loops in Next.js
const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  title, 
  content,
  className = "btn btn-dark" 
}) => {
  const label = title ?? content;

  return <>{children || <button className={className}>{label}</button>}</>;
};

export default Tooltip;
