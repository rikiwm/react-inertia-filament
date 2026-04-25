import { Theme } from "@/Types/enums";

export interface ThemeContextProps {
    theme: Theme;
    systemTheme: Theme;
    isDarkMode: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}
