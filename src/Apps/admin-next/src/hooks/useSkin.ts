import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleSkin } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { SkinMode } from "@/configs/themeConfig";

const useSkin = (): [SkinMode, (mod: SkinMode) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const skin = useSelector((state: RootState) => state.layout.skin);

  const setSkin = (mod: SkinMode): void => {
    dispatch(handleSkin(mod));
  };

  useEffect(() => {
    const body = window.document.body;
    const classNames = {
      default: "skin--default",
      bordered: "skin--bordered",
    };

    if (skin === "default") {
      body.classList.add(classNames.default);
      body.classList.remove(classNames.bordered);
    } else if (skin === "bordered") {
      body.classList.add(classNames.bordered);
      body.classList.remove(classNames.default);
    }
  }, [skin]);

  return [skin, setSkin];
};

export default useSkin;
