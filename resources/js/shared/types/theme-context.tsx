import type { ThemeContextProps } from "@/Types/context";
import { createContext } from "react";

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export default ThemeContext;
