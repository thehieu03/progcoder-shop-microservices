import { useSelector, useDispatch } from "react-redux";
import { handleContentWidth } from "@/store/layout";
import type { RootState, AppDispatch } from "@/shared/types/store.types";
import type { ContentWidth } from "@/configs/themeConfig";

const useContentWidth = (): [ContentWidth, (val: ContentWidth) => void] => {
  const dispatch = useDispatch<AppDispatch>();
  const contentWidth = useSelector((state: RootState) => state.layout.contentWidth);

  // ** Toggles Content Width
  const setContentWidth = (val: ContentWidth): void => {
    dispatch(handleContentWidth(val));
  };

  return [contentWidth, setContentWidth];
};

export default useContentWidth;
