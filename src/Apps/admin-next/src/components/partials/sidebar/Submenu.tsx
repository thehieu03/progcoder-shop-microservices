"use client";
import React from "react";
import { Collapse } from "react-collapse";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Multilevel from "./Multi";

interface MultiMenuItem {
  multiTitle: string;
  multiLink: string;
}

interface ChildMenuItem {
  childtitle: string;
  childlink: string;
  childicon?: string;
  multi_menu?: MultiMenuItem[];
  isExternal?: boolean;
  isBlank?: boolean;
}

interface MenuItem {
  isHeadr?: boolean;
  title: string;
  icon?: string;
  link?: string;
  child?: ChildMenuItem[];
  badge?: string;
}

interface SubmenuProps {
  activeSubmenu: number | null;
  item: MenuItem;
  i: number;
  toggleMultiMenu: (j: number) => void;
  activeMultiMenu: number | null;
}

const Submenu: React.FC<SubmenuProps> = ({
  activeSubmenu,
  item,
  i,
  toggleMultiMenu,
  activeMultiMenu,
}) => {
  const pathname = usePathname();
  const locationName = pathname.replace(/^\//, "");

  return (
    <Collapse isOpened={activeSubmenu === i}>
      <ul className="sub-menu  space-y-4  ">
        {item.child?.map((subItem, j) => (
          <li key={j} className="block pl-4 pr-1 first:pt-4  last:pb-4">
            {subItem?.multi_menu ? (
              <div>
                <div
                  onClick={() => toggleMultiMenu(j)}
                  className={`${
                    activeMultiMenu
                      ? " text-black dark:text-white font-medium"
                      : "text-slate-600 dark:text-slate-300"
                  } text-sm flex space-x-3 items-center transition-all duration-150 cursor-pointer rtl:space-x-reverse`}>
                  <span
                    className={`${
                      activeMultiMenu === j
                        ? " bg-slate-900 dark:bg-slate-300 ring-4 ring-slate-500/20 dark:ring-slate-300/20!"
                        : ""
                    } h-2 w-2 rounded-full border border-slate-600! dark:border-white inline-block flex-none `}></span>
                  <span className="flex-1">{subItem.childtitle}</span>
                  <span className="flex-none">
                    <span
                      className={`menu-arrow transform transition-all duration-300 ${
                        activeMultiMenu === j ? " rotate-90" : ""
                      }`}>
                      <Icon icon="ph:caret-right" />
                    </span>
                  </span>
                </div>
                <Multilevel
                  activeMultiMenu={activeMultiMenu}
                  j={j}
                  subItem={subItem}
                />
              </div>
            ) : subItem.isExternal || subItem.isBlank ? (
              <a
                href={subItem.childlink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-300 text-sm flex space-x-3 items-center transition-all duration-150 rtl:space-x-reverse hover:text-black dark:hover:text-white">
                <span className="h-2 w-2 rounded-full border border-slate-600! dark:border-white inline-block flex-none"></span>
                <span className="flex-1">{subItem.childtitle}</span>
                <Icon
                  icon="heroicons:arrow-top-right-on-square"
                  className="w-4 h-4"
                />
              </a>
            ) : (
              <Link href={subItem.childlink}>
                {(() => {
                  const active = subItem.childlink === locationName;
                  return (
                    <span
                      className={`${
                        active
                          ? " text-black dark:text-white font-medium"
                          : "text-slate-600 dark:text-slate-300"
                      } text-sm flex space-x-3 items-center transition-all duration-150 rtl:space-x-reverse`}>
                      <span
                        className={`${
                          active
                            ? " bg-slate-900 dark:bg-slate-300 ring-4 ring-slate-500/20 dark:ring-slate-300/20!"
                            : ""
                        } h-2 w-2 rounded-full border border-slate-600! dark:border-white inline-block flex-none`}></span>
                      <span className="flex-1">{subItem.childtitle}</span>
                    </span>
                  );
                })()}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Collapse>
  );
};

export default Submenu;
