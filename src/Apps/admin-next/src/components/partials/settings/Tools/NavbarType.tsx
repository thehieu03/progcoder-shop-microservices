"use client";

import React from "react";
import Radio from "@/components/ui/Radio";
import useNavbarType from "@/hooks/useNavbarType";

interface NavbarTypeOption {
  label: string;
  value: "sticky" | "static" | "floating" | "hidden";
}

const NavType= () => {
  const [navbarType, setNavbarType] = useNavbarType();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNavbarType(e.target.value as "sticky" | "static" | "floating" | "hidden");
  };

  const navTypes: NavbarTypeOption[] = [
    {
      label: "Sticky",
      value: "sticky",
    },
    {
      label: "Static",
      value: "static",
    },
    {
      label: "Floating",
      value: "floating",
    },
    {
      label: "Hidden",
      value: "hidden",
    },
  ];

  return (
    <div>
      <h4 className="text-slate-600 text-base dark:text-slate-300 mb-2 font-normal">
        Navbar Type
      </h4>
      <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
        {navTypes?.map((item, index) => (
          <Radio
            key={index}
            label={item.label}
            name="navbarType"
            value={item.value}
            checked={navbarType === item.value}
            onChange={handleChange}
            className="h-4 w-4"
          />
        ))}
      </div>
    </div>
  );
};

export default NavType;
