import { createContext, useContext, useMemo, useState } from "react";
type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme() {
  const value = useContext(ThemeContext);

  if (value === null) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return value;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    [theme]
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      current theme: {theme}
    </button>
  );
}