import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleDarkMode } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";

const useDarkmode = (): [boolean, (mode: boolean) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useSelector((state: RootState) => state.layout.darkMode);

  // ** Return a wrapped version of useState's setter function
  const setDarkMode = (mode: boolean): void => {
    dispatch(handleDarkMode(mode));
  };

  useEffect(() => {
    // ** Get Body Tag
    const body = window.document.body;
    // define classNames
    const classNames = {
      dark: "dark",
      light: "light",
    };
    // ** Check if dark mode is enabled
    if (isDark) {
      body.classList.add(classNames.dark);
      body.classList.remove(classNames.light);
    } else {
      body.classList.add(classNames.light);
      body.classList.remove(classNames.dark);
    }
  }, [isDark]);

  return [isDark, setDarkMode];
};

export default useDarkmode;
