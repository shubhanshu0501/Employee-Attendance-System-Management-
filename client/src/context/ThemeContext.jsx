import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved : "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.className = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const resetThemeToLight = () => {
        setTheme("light");
        localStorage.setItem("theme", "light");
        document.documentElement.setAttribute("data-theme", "light");
        document.body.className = "light";
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, resetThemeToLight }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: localStorage.getItem("theme") || "light",
            toggleTheme: () => {},
            resetThemeToLight: () => {
                localStorage.setItem("theme", "light");
                document.documentElement.setAttribute("data-theme", "light");
                document.body.className = "light";
            }
        };
    }
    return context;
}
