"use client";
import React, { Fragment, ReactNode } from "react";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface DropdownItem {
  label: string;
  link?: string;
  icon?: string;
  hasDivider?: boolean;
}

interface DropdownProps {
  label?: ReactNode;
  wrapperClass?: string;
  labelClass?: string;
  children?: ReactNode;
  anchor?: "top" | "bottom" | "left" | "right" | "top start" | "top end" | "bottom start" | "bottom end" | "left start" | "left end" | "right start" | "right end";
  classMenuItems?: string;
  items?: DropdownItem[];
  classItem?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  wrapperClass = "inline-block",
  labelClass = "",
  children,
  anchor = "bottom start",
  classMenuItems = "mt-2 w-[200px]",
  items = [
    { label: "Action", link: "#" },
    { label: "Another action", link: "#" },
    { label: "Something else here", link: "#" },
  ],
  classItem = "px-4 py-2",
  className = "",
}) => {
  const handleOpenDropdown = (): void => {
    if (typeof window !== "undefined") {
      document.documentElement.style.paddingRight = "0px";
    }
  };

  return (
    <div className={`relative ${wrapperClass}`}>
      <Menu>
        <MenuButton
          className={`block w-full ${labelClass}`}
          onClick={handleOpenDropdown}>
          {label}
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <MenuItems
            className={`absolute ltr:right-0 rtl:left-0 origin-top-right  border border-slate-100
            rounded bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm z-9999 focus-visible:outline-none
            ${classMenuItems}
            `}>
            <div>
              {children
                ? children
                : items.map((item, index) => (
                    <MenuItem key={index}>
                      {({ active }: { active: boolean }) => (
                        <div
                          className={`${
                            active
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-600/50 dark:text-slate-300"
                              : "text-slate-600 dark:text-slate-300"
                          } block ${
                            item.hasDivider
                              ? "border-t border-slate-100 dark:border-slate-700"
                              : ""
                          }`}>
                          {item.link ? (
                            <Link
                              href={item.link}
                              className={`block ${classItem}`}>
                              {item.icon ? (
                                <div className="flex items-center">
                                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                                    <Icon icon={item.icon} />
                                  </span>
                                  <span className="block text-sm">
                                    {item.label}
                                  </span>
                                </div>
                              ) : (
                                <span className="block text-sm">
                                  {item.label}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div
                              className={`block cursor-pointer ${classItem}`}>
                              {item.icon ? (
                                <div className="flex items-center">
                                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                                    <Icon icon={item.icon} />
                                  </span>
                                  <span className="block text-sm">
                                    {item.label}
                                  </span>
                                </div>
                              ) : (
                                <span className="block text-sm">
                                  {item.label}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </MenuItem>
                  ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
};

export default Dropdown;

