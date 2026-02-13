"use client";

import React from "react";

interface Brand {
  value: string;
  label: string;
  count: number;
}

interface BrandsCheckboxProps {
  brand: Brand;
}

const BrandsCheckbox: React.FC<BrandsCheckboxProps> = ({ brand }) => {
  return (
    <div className="flex justify-between space-y-1">
      <label
        key={brand.value}
        className=" flex items-center space-x-3 rtl:space-x-reverse  font-normal text-sm text-slate-900 dark:text-slate-300"
      >
        <input type="checkbox" className="table-checkbox" value={brand.value} />
        <span>{brand.label}</span>
      </label>
      <span className="text-slate-500 dark:text-slate-500 text-xs font-normal">
        {brand.count}
      </span>
    </div>
  );
};

export default BrandsCheckbox;
