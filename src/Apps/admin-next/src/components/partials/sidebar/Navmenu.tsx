"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapse } from "react-collapse";
import Icon from "@/components/ui/Icon";
import { useDispatch } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";
import type { AppDispatch } from "@/shared/types/store.types";

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

interface NavmenuProps {
  menus: MenuItem[];
}

const Navmenu: React.FC<NavmenuProps> = ({ menus }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  const toggleSubmenu = (i: number) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const pathname = usePathname();
  const locationName = pathname.replace(/^\//, "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const [activeMultiMenu, setMultiMenu] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const toggleMultiMenu = (j: number) => {
    if (activeMultiMenu === j) {
      setMultiMenu(null);
    } else {
      setMultiMenu(j);
    }
  };

  const isLocationMatch = (targetLocation: string): boolean => {
    return (
      locationName === targetLocation ||
      locationName.startsWith(`${targetLocation}/`)
    );
  };

  useEffect(() => {
    let submenuIndex: number | null = null;
    let multiMenuIndex: number | null = null;
    
    menus.forEach((item, i) => {
      if (item.link && isLocationMatch(item.link)) {
        submenuIndex = i;
      }

      if (item.child) {
        item.child.forEach((childItem, j) => {
          if (isLocationMatch(childItem.childlink)) {
            submenuIndex = i;
          }

          if (childItem.multi_menu) {
            childItem.multi_menu.forEach((nestedItem) => {
              if (isLocationMatch(nestedItem.multiLink)) {
                submenuIndex = i;
                multiMenuIndex = j;
              }
            });
          }
        });
      }
    });

    document.title = `progcoder  | ${locationName}`;

    setActiveSubmenu(submenuIndex);
    setMultiMenu(multiMenuIndex);

    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [pathname, menus, mobileMenu, setMobileMenu]);

  return (
    <>
      <ul>
        {menus.map((item, i) => (
          <li
            key={i}
            className={` single-sidebar-menu 
              ${item.child ? "item-has-children" : ""}
              ${activeSubmenu === i ? "open" : ""}
              ${locationName === item.link ? "menu-item-active" : ""}`}>
            {/* single menu with no childred*/}
            {!item.child && !item.isHeadr && (
              <Link className="menu-link" href={item.link || "#"}>
                <span className="menu-icon grow-0">
                  <Icon icon={item.icon || ""} />
                </span>
                <div className="text-box grow">{item.title}</div>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </Link>
            )}
            {/* only for menulabel */}
            {item.isHeadr && !item.child && (
              <div className="menulabel">{item.title}</div>
            )}
            {/*    !!sub menu parent   */}
            {item.child && (
              <div
                className={`menu-link ${
                  activeSubmenu === i
                    ? "parent_active not-collapsed"
                    : "collapsed"
                }`}
                onClick={() => toggleSubmenu(i)}>
                <div className="flex-1 flex items-start">
                  <span className="menu-icon">
                    <Icon icon={item.icon || ""} />
                  </span>
                  <div className="text-box">{item.title}</div>
                </div>
                <div className="flex-0">
                  <div
                    className={`menu-arrow transform transition-all duration-300 ${
                      activeSubmenu === i ? " rotate-90" : ""
                    }`}>
                    <Icon icon="heroicons-outline:chevron-right" />
                  </div>
                </div>
              </div>
            )}

            <Submenu
              activeSubmenu={activeSubmenu}
              item={item}
              i={i}
              toggleMultiMenu={toggleMultiMenu}
              activeMultiMenu={activeMultiMenu}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default Navmenu;
