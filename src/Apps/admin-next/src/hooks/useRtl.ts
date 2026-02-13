import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleRtl } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useRtl = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const isRtl = useSelector((state: RootState) => state.layout.isRTL);

  const setRtl = (val: boolean): void => {
    dispatch(handleRtl(val));
  };

  useEffect(() => {
    const element = document.getElementsByTagName("html")[0];

    if (isRtl) {
      element.setAttribute("dir", "rtl");
    } else {
      element.setAttribute("dir", "ltr");
    }
  }, [isRtl]);

  return [isRtl, setRtl];
};

export default useRtl;
