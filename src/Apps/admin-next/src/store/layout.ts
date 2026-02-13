import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// theme config import
import themeConfig from "@/configs/themeConfig";
import type { SkinMode, ContentWidth, MenuLayoutType, NavbarType, FooterType } from "@/configs/themeConfig";

// Helper to safely get from local storage
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const item = window.localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const initialDarkMode = (): boolean =>
  getFromLocalStorage("darkMode", themeConfig.layout.darkMode);
const initialSidebarCollapsed = (): boolean =>
  getFromLocalStorage("sidebarCollapsed", themeConfig.layout.menu.isCollapsed);
const initialSemiDarkMode = (): boolean =>
  getFromLocalStorage("semiDarkMode", themeConfig.layout.semiDarkMode);
const initialRtl = (): boolean =>
  getFromLocalStorage("direction", themeConfig.layout.isRTL);
const initialSkin = (): SkinMode => getFromLocalStorage("skin", themeConfig.layout.skin);
const initialType = (): MenuLayoutType => getFromLocalStorage("type", themeConfig.layout.type);
const initialMonochrome = (): boolean =>
  getFromLocalStorage("monochrome", themeConfig.layout.isMonochrome);

export interface LayoutState {
  isRTL: boolean;
  darkMode: boolean;
  isCollapsed: boolean;
  customizer: boolean;
  semiDarkMode: boolean;
  skin: SkinMode;
  contentWidth: ContentWidth;
  type: MenuLayoutType;
  menuHidden: boolean;
  navBarType: NavbarType;
  footerType: FooterType;
  mobileMenu: boolean;
  isMonochrome: boolean;
}

const initialState: LayoutState = {
  isRTL: initialRtl(),
  darkMode: initialDarkMode(),
  isCollapsed: initialSidebarCollapsed(),
  customizer: themeConfig.layout.customizer,
  semiDarkMode: initialSemiDarkMode(),
  skin: initialSkin(),
  contentWidth: themeConfig.layout.contentWidth,
  type: initialType(),
  menuHidden: themeConfig.layout.menu.isHidden,
  navBarType: themeConfig.layout.navBarType,
  footerType: themeConfig.layout.footerType,
  mobileMenu: themeConfig.layout.mobileMenu,
  isMonochrome: initialMonochrome(),
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    // handle dark mode
    handleDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("darkMode", JSON.stringify(action.payload));
      }
    },
    // handle sidebar collapsed
    handleSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sidebarCollapsed", JSON.stringify(action.payload));
      }
    },
    // handle customizer
    handleCustomizer: (state, action: PayloadAction<boolean>) => {
      state.customizer = action.payload;
    },
    // handle semiDark
    handleSemiDarkMode: (state, action: PayloadAction<boolean>) => {
      state.semiDarkMode = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("semiDarkMode", JSON.stringify(action.payload));
      }
    },
    // handle rtl
    handleRtl: (state, action: PayloadAction<boolean>) => {
      state.isRTL = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("direction", JSON.stringify(action.payload));
      }
    },
    // handle skin
    handleSkin: (state, action: PayloadAction<SkinMode>) => {
      state.skin = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("skin", JSON.stringify(action.payload));
      }
    },
    // handle content width
    handleContentWidth: (state, action: PayloadAction<ContentWidth>) => {
      state.contentWidth = action.payload;
    },
    // handle type
    handleType: (state, action: PayloadAction<MenuLayoutType>) => {
      state.type = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("type", JSON.stringify(action.payload));
      }
    },
    // handle menu hidden
    handleMenuHidden: (state, action: PayloadAction<boolean>) => {
      state.menuHidden = action.payload;
    },
    // handle navbar type
    handleNavBarType: (state, action: PayloadAction<NavbarType>) => {
      state.navBarType = action.payload;
    },
    // handle footer type
    handleFooterType: (state, action: PayloadAction<FooterType>) => {
      state.footerType = action.payload;
    },
    handleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenu = action.payload;
    },
    handleMonoChrome: (state, action: PayloadAction<boolean>) => {
      state.isMonochrome = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("monochrome", JSON.stringify(action.payload));
      }
    },
  },
});

export const {
  handleDarkMode,
  handleSidebarCollapsed,
  handleCustomizer,
  handleSemiDarkMode,
  handleRtl,
  handleSkin,
  handleContentWidth,
  handleType,
  handleMenuHidden,
  handleNavBarType,
  handleFooterType,
  handleMobileMenu,
  handleMonoChrome,
} = layoutSlice.actions;

export default layoutSlice.reducer;
