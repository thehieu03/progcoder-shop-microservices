import { useSelector, useDispatch } from "react-redux";
import { handleNavBarType } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { NavbarType } from "@/configs/themeConfig";

const useNavbarType = (): [NavbarType, (val: NavbarType) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const navbarType = useSelector((state: RootState) => state.layout.navBarType);

  const setNavbarType = (val: NavbarType): void => {
    dispatch(handleNavBarType(val));
  };

  return [navbarType, setNavbarType];
};

export default useNavbarType;
