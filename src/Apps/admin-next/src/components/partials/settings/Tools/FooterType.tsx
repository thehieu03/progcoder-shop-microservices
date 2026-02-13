"use client";

import React from "react";
import Radio from "@/components/ui/Radio";
import useFooterType from "@/hooks/useFooterType";

interface FooterTypeOption {
  label: string;
  value: "sticky" | "static" | "hidden";
}

const FooType= () => {
  const [footerType, setFooterType] = useFooterType();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFooterType(e.target.value as "sticky" | "static" | "hidden");
  };

  const fotypes: FooterTypeOption[] = [
    {
      label: "Sticky",
      value: "sticky",
    },
    {
      label: "Static",
      value: "static",
    },
    {
      label: "Hidden",
      value: "hidden",
    },
  ];

  return (
    <div>
      <h4 className="text-slate-600 text-base dark:text-slate-300 mb-2 font-normal">
        Footer Type
      </h4>
      <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
        {fotypes?.map((item, index) => (
          <Radio
            key={index}
            label={item.label}
            name="navbarType"
            value={item.value}
            checked={footerType === item.value}
            onChange={handleChange}
            className="h-4 w-4"
          />
        ))}
      </div>
    </div>
  );
};

export default FooType;
