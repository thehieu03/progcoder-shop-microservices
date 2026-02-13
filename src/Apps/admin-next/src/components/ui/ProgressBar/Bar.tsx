import React from "react";

interface BarProps {
  value?: number;
  className?: string;
  showValue?: boolean;
  striped?: boolean;
  animate?: boolean;
}

const Bar: React.FC<BarProps> = ({ value, className, showValue, striped, animate }) => {
  // striped style

  return (
    <div
      className={`flex flex-col text-center whitespace-nowrap justify-center h-full progress-bar  ${className} ${
        striped ? "stripes" : ""
      }
      ${animate ? "animate-stripes" : ""}
      `}
      style={{ width: `${value}%` }}
    >
      {showValue && (
        <span className="text-[10px] text-white font-bold">{value + "%"}</span>
      )}
    </div>
  );
};

export default Bar;
