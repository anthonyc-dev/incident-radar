import { createContext } from "react";
import type { AuthContextValue } from "./AuthProvider";

// ONLY the context goes here
export const AuthContext = createContext<AuthContextValue | null>(null);

