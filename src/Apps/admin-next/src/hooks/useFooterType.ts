import { useSelector, useDispatch } from "react-redux";
import { handleFooterType } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { FooterType } from "@/configs/themeConfig";

const useFooterType = (): [FooterType, (val: FooterType) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const footerType = useSelector((state: RootState) => state.layout.footerType);

  const setFooterType = (val: FooterType): void => {
    dispatch(handleFooterType(val));
  };

  return [footerType, setFooterType];
};

export default useFooterType;
