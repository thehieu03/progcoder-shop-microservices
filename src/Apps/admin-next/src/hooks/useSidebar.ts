import { useSelector, useDispatch } from "react-redux";
import { handleSidebarCollapsed } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useSidebar = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const collapsed = useSelector((state: RootState) => state.layout.isCollapsed);

  // ** Toggles Menu Collapsed
  const setMenuCollapsed = (val: boolean): void => {
    dispatch(handleSidebarCollapsed(val));
  };

  return [collapsed, setMenuCollapsed];
};

export default useSidebar;
