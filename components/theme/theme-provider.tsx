"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("expaura-theme") as Theme | null;
        if (stored === "light" || stored === "dark") return stored;
      }
    } catch {
      /* localStorage unavailable */
    }
    return "dark";
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("expaura-theme", theme);
  }, [theme]);

  const toggle = React.useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
