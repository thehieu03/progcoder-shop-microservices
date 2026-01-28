import { useState, useEffect } from "react";

export default function useWidth() {
  const [width, setWidth] = useState(0); // Default to 0 or a sensible default for SSR

  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  useEffect(() => {
    // Set initial width on client mount
    setWidth(window.innerWidth);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { width, breakpoints };
}
