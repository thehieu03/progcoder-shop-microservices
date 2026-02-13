import { useSelector, useDispatch } from "react-redux";
import { handleMenuHidden } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useMenuHidden = (): [boolean, (value: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const menuHidden = useSelector((state: RootState) => state.layout.menuHidden);

  const setMenuHidden = (value: boolean): void => {
    dispatch(handleMenuHidden(value));
  };

  return [menuHidden, setMenuHidden];
};

export default useMenuHidden;
