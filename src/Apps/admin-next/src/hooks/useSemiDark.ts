import { handleSemiDarkMode } from "@/store/layout";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useSemiDark = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const isSemiDark = useSelector((state: RootState) => state.layout.semiDarkMode);

  const setSemiDark = (val: boolean): void => {
    dispatch(handleSemiDarkMode(val));
  };

  return [isSemiDark, setSemiDark];
};

export default useSemiDark;
