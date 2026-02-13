import { useSelector, useDispatch } from "react-redux";
import { handleType } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { MenuLayoutType } from "@/configs/themeConfig";

const useMenuLayout = (): [MenuLayoutType, (value: MenuLayoutType) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const menuType = useSelector((state: RootState) => state.layout.type);

  const setMenuLayout = (value: MenuLayoutType): void => {
    dispatch(handleType(value));
  };

  return [menuType, setMenuLayout];
};

export default useMenuLayout;
