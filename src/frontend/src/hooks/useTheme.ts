import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function getInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // localStorage unavailable
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // localStorage unavailable
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return { isDark, toggleTheme };
}
