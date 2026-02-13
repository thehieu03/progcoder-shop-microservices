import { v4 as uuidv4 } from "uuid";

export type SkinMode = "default" | "bordered";
export type ContentWidth = "full" | "boxed";
export type MenuLayoutType = "vertical" | "horizontal";
export type NavbarType = "sticky" | "floating" | "static" | "hidden";
export type FooterType = "sticky" | "static" | "hidden";

export interface MenuConfig {
  isCollapsed: boolean;
  isHidden: boolean;
}

export interface LayoutConfig {
  isRTL: boolean;
  darkMode: boolean;
  semiDarkMode: boolean;
  skin: SkinMode;
  contentWidth: ContentWidth;
  type: MenuLayoutType;
  navBarType: NavbarType;
  footerType: FooterType;
  isMonochrome: boolean;
  menu: MenuConfig;
  mobileMenu: boolean;
  customizer: boolean;
}

export interface ThemeConfig {
  app: {
    name: string;
  };
  layout: LayoutConfig;
}

const themeConfig: ThemeConfig = {
  app: {
    name: "progcoder React",
  },
  // layout
  layout: {
    isRTL: false,
    darkMode: false,
    semiDarkMode: false,
    skin: "default",
    contentWidth: "full",
    type: "vertical",
    navBarType: "sticky",
    footerType: "static",
    isMonochrome: false,
    menu: {
      isCollapsed: false,
      isHidden: false,
    },
    mobileMenu: false,
    customizer: false,
  },
};

export default themeConfig;
