import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type ThemeCtx = { darkMode: boolean; toggleDark: () => void };
const ThemeContext = createContext<ThemeCtx>({ darkMode: false, toggleDark: () => {} });

// ── Routes that should never be affected by dark mode ──
const EXCLUDED_ROUTES = ["/sign-in", "/sign-up"];

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const location = useLocation();

  const isExcluded = EXCLUDED_ROUTES.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    if (darkMode && !isExcluded) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, isExcluded]);

  const toggleDark = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);