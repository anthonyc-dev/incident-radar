import { AuthContext } from "@/contexts/AuthContext";
import type { AuthContextValue } from "@/contexts/AuthProvider";
import { useContext } from "react"


export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
