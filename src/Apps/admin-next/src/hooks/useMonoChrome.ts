import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleMonoChrome } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useMonoChrome = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const isMonoChrome = useSelector((state: RootState) => state.layout.isMonochrome);

  const setMonoChrome = (val: boolean): void => {
    dispatch(handleMonoChrome(val));
  };

  useEffect(() => {
    const element = document.getElementsByTagName("html")[0];

    if (isMonoChrome) {
      element.classList.add("grayscale");
    } else {
      element.classList.remove("grayscale");
    }
  }, [isMonoChrome]);

  return [isMonoChrome, setMonoChrome];
};

export default useMonoChrome;
