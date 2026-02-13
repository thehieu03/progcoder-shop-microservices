import { useTranslation } from "react-i18next";
import { menuItems, topMenu } from "@/constant/data";

// Type definitions for menu items
interface ChildMenuItem {
  childtitle: string;
  childlink: string;
  childicon?: string;
  isBlank?: boolean;
}

interface MultiMenuItem {
  multiTitle: string;
  multiLink: string;
}

interface ChildMenuItemWithMulti extends ChildMenuItem {
  multi_menu?: MultiMenuItem[];
}

interface SingleMegamenuItem {
  m_childtitle: string;
  m_childlink: string;
}

interface MegamenuItem {
  megamenutitle: string;
  singleMegamenu?: SingleMegamenuItem[];
}

interface MenuItem {
  isHeadr?: boolean;
  title: string;
  icon?: string;
  link?: string;
  child?: ChildMenuItemWithMulti[];
  megamenu?: MegamenuItem[];
}

interface UseMenuTranslationReturn {
  menuItems: MenuItem[];
  topMenu: MenuItem[];
}

// Menu title to translation key mapping
const menuTitleMap: Record<string, string> = {
  "menu": "menu",
  "Dashboard": "dashboard",
  "changelog": "changelog",
  "apps": "apps",
  "Chat": "chat",
  "Email": "email",
  "Kanban": "kanban",
  "Calender": "calender",
  "Todo": "todo",
  "Projects": "projects",
  "Ecommerce": "ecommerce",
  "Pages": "pages",
  "Authentication": "authentication",
  "Utility": "utility",
  "Elements": "elements",
  "Widgets": "widgets",
  "Components": "components",
  "Forms": "forms",
  "Table": "table",
  "Chart": "chart",
  "Map": "map",
  "Icons": "icons",
  "Multi Level": "multiLevel",
  "Analytics Dashboard": "analyticsDashboard",
  "Ecommerce Dashboard": "ecommerceDashboard",
  "Project  Dashbaord": "projectDashboard",
  " CRM Dashbaord": "crmDashboard",
  "Banking Dashboard": "bankingDashboard",
  "Project Details": "projectDetails",
  "User App": "userApp",
  "Admin App": "adminApp",
  "Products": "products",
  "Products Details": "productsDetails",
  "Cart": "cart",
  "Wishlist": "wishlist",
  "Orders": "orders",
  "Add Product": "addProduct",
  "Edit Product": "editProduct",
  "Customers": "customers",
  "Sellers": "sellers",
  "Invoice": "invoice",
  "Signin One": "signinOne",
  "Signin Two": "signinTwo",
  "Signin Three": "signinThree",
  "Signup One": "signupOne",
  "Signup Two": "signupTwo",
  "Signup Three": "signupThree",
  "Forget Password One": "forgetPasswordOne",
  "Forget Password Two": "forgetPasswordTwo",
  "Forget Password Three": "forgetPasswordThree",
  "Lock Screen One": "lockScreenOne",
  "Lock Screen Two": "lockScreenTwo",
  "Lock Screen Three": "lockScreenThree",
  "Pricing": "pricing",
  "FAQ": "faq",
  "Blog": "blog",
  "Blank page": "blankPage",
  "Prfoile": "profile",
  "Settings": "settings",
  "404 page": "404Page",
  "Coming Soon": "comingSoon",
  "Under Maintanance page": "underMaintenance",
  "Basic": "basic",
  "Statistic": "statistic",
  "Typography": "typography",
  "Colors": "colors",
  "Alert": "alert",
  "Button": "button",
  "Card": "card",
  "Carousel": "carousel",
  "Dropdown": "dropdown",
  "Image": "image",
  "Modal": "modal",
  "Progress bar": "progressBar",
  "Placeholder": "placeholder",
  "Tab & Accordion": "tabAccordion",
  "Badges": "badges",
  "Paginatins": "paginations",
  "Video": "video",
  "Tooltip & Popover": "tooltipPopover",
  "Input": "input",
  "Input group": "inputGroup",
  "Input layout": "inputLayout",
  "Form validation": "formValidation",
  "Wizard": "wizard",
  "Input mask": "inputMask",
  "File input": "fileInput",
  "Form repeater": "formRepeater",
  "Textarea": "textarea",
  "Checkbox": "checkbox",
  "Radio button": "radioButton",
  "Switch": "switch",
  "Select & Vue select": "select",
  "Date time picker": "dateTimePicker",
  "Basic Table": "basicTable",
  "React Table": "reactTable",
  "Apex chart": "apexChart",
  "Chart js": "chartJs",
  "Recharts": "recharts",
  "Level 1.1": "level11",
  "Level 1.2": "level12",
  "Level 2.1": "level21",
  "Level 2.2": "level22",
  // External links
  "Grafana": "grafana",
  "Prometheus": "prometheus",
  "Keycloak": "keycloak",
  "MailHog": "mailhog",
  "RabbitMQ": "rabbitmq",
  "Github": "github",
  // New menu items
  "Coupons": "couponsMenu",
  "Quản lý sản phẩm": "manageProducts",
  "Tạo sản phẩm": "createProduct",
  "Quản lý kho": "manageInventory",
  "Quản lý danh mục": "manageCategories",
  "Quản lý mã giảm giá": "manageCoupons",
  "Tạo mã giảm giá": "createCoupon",
};

const useMenuTranslation = (): UseMenuTranslationReturn => {
  const { t } = useTranslation();

  const getTranslationKey = (title: string): string => {
    const key = menuTitleMap[title] || title.toLowerCase().replace(/\s+/g, "");
    return `menu.${key}`;
  };

  const translateMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.map((item) => {
      const translated: MenuItem = { ...item };

      // Translate title
      if (item.title) {
        const translationKey = getTranslationKey(item.title);
        translated.title = t(translationKey, item.title);
      }

      // Translate child items
      if (item.child) {
        translated.child = item.child.map((child) => {
          const translatedChild: ChildMenuItemWithMulti = { ...child };
          if (child.childtitle) {
            const translationKey = getTranslationKey(child.childtitle.trim());
            translatedChild.childtitle = t(translationKey, child.childtitle);
          }

          // Translate multi_menu
          if (child.multi_menu) {
            translatedChild.multi_menu = child.multi_menu.map((multi) => {
              const translatedMulti: MultiMenuItem = { ...multi };
              if (multi.multiTitle) {
                const translationKey = getTranslationKey(multi.multiTitle);
                translatedMulti.multiTitle = t(translationKey, multi.multiTitle);
              }
              return translatedMulti;
            });
          }

          return translatedChild;
        });
      }

      // Translate megamenu
      if (item.megamenu) {
        translated.megamenu = item.megamenu.map((mega) => {
          const translatedMega: MegamenuItem = { ...mega };
          if (mega.megamenutitle) {
            const translationKey = getTranslationKey(mega.megamenutitle);
            translatedMega.megamenutitle = t(translationKey, mega.megamenutitle);
          }

          if (mega.singleMegamenu) {
            translatedMega.singleMegamenu = mega.singleMegamenu.map((single) => {
              const translatedSingle: SingleMegamenuItem = { ...single };
              if (single.m_childtitle) {
                const translationKey = getTranslationKey(single.m_childtitle);
                translatedSingle.m_childtitle = t(translationKey, single.m_childtitle);
              }
              return translatedSingle;
            });
          }

          return translatedMega;
        });
      }

      return translated;
    });
  };

  const translatedMenuItems = translateMenuItems(menuItems);
  const translatedTopMenu = translateMenuItems(topMenu);

  return {
    menuItems: translatedMenuItems,
    topMenu: translatedTopMenu,
  };
};

export default useMenuTranslation;
