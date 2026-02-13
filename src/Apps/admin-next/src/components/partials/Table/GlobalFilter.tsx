"use client";
import React, { useState, ChangeEvent } from "react";
import Textinput from "@/components/ui/Textinput";

interface GlobalFilterProps {
  filter: string | undefined;
  setFilter: (value: string | undefined) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
  const [value, setValue] = useState(filter);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setFilter(e.target.value || undefined);
  };

  return (
    <div>
      <Textinput
        value={value || ""}
        onChange={onChange}
        placeholder="search..."
      />
    </div>
  );
};

export default GlobalFilter;
