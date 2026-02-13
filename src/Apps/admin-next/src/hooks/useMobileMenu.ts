import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleMobileMenu } from "@/store/layout";
import { usePathname } from "next/navigation";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useMobileMenu = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const mobileMenu = useSelector((state: RootState) => state.layout.mobileMenu);
  const pathname: string | null = usePathname();

  // ** Toggles Mobile Menu
  const setMobileMenu = (val: boolean): void => {
    dispatch(handleMobileMenu(val));
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return [mobileMenu, setMobileMenu];
};

export default useMobileMenu;
