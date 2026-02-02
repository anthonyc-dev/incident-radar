import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import {
    apiClient,
    setAccessToken as setApiAccessToken,
    SESSION_EXPIRED_EVENT,
} from "@/lib/api-client";
import { getOrCreateDeviceId } from "@/lib/device-id";
import type { LoginCredentials, User } from "@/types/auth.types";
import { AuthContext } from "./AuthContext";

const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    /**
     * ✅ SINGLE SOURCE OF TRUTH
     * Applies auth session state everywhere (login / refresh / register)
     */
    const applyAuth = useCallback(
        (data?: { user?: User; accessToken?: string }) => {
            if (data?.accessToken) {
                setAccessToken(data.accessToken);
                setApiAccessToken(data.accessToken);
                if (data.user) setUser(data.user);
            } else {
                setApiAccessToken(null);
                setAccessToken(null);
                setUser(null);
            }
        },
        []
    );

    /**
     * 🔄 Hydrate session on app load (persistent login)
     */
    useEffect(() => {
        apiClient
            .post<{ user: User; accessToken?: string }>(
                "/api/auth/refresh-token",
                { deviceId: getOrCreateDeviceId() },
                { withCredentials: true }
            )
            .then(({ data }) => applyAuth(data))
            .catch(() => applyAuth())
            .finally(() => setIsLoading(false));
    }, [applyAuth]);

    /**
     * 🔐 Login
     */
    const login = useCallback(
        async (email: string, password: string) => {
            setError(null);

            try {
                const { data } = await apiClient.post<
                    { user: User; accessToken?: string }
                >(
                    "/api/auth/login",
                    {
                        email,
                        password,
                        deviceId: getOrCreateDeviceId(),
                    } satisfies LoginCredentials,
                    { withCredentials: true }
                );

                applyAuth(data);
            } catch (err) {
                setError(
                    (isAxiosError(err) && err.response?.data?.message) ||
                    "Login failed"
                );
                throw err;
            }
        },
        [applyAuth]
    );

    /**
     * 🧾 Register
     */
    const register = useCallback(
        async (name: string, email: string, password: string) => {
            setError(null);

            try {
                const { data } = await apiClient.post<
                    { user: User; accessToken?: string }
                >(
                    "/api/auth/register",
                    {
                        name,
                        email,
                        password,
                        deviceId: getOrCreateDeviceId(),
                    },
                    { withCredentials: true }
                );

                applyAuth(data);
            } catch (err) {
                setError(
                    (isAxiosError(err) && err.response?.data?.message) ||
                    "Registration failed"
                );
                throw err;
            }
        },
        [applyAuth]
    );

    /**
     * 🚪 Logout
     */
    const logout = useCallback(async () => {
        setError(null);
        try {
            await apiClient.post(
                "/api/auth/logout",
                {},
                { withCredentials: true }
            );
        } finally {
            applyAuth();
        }
    }, [applyAuth]);

    /**
     * ⛔ Session expired (refresh failed)
     */
    useEffect(() => {
        const onSessionExpired = () => {
            applyAuth();
            setError("Session expired. Please sign in again.");
        };

        window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
        return () =>
            window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    }, [applyAuth]);

    /**
     * 🔁 Proactive refresh (silent)
     */
    useEffect(() => {
        if (!accessToken) return;

        const id = setInterval(() => {
            apiClient
                .post<{ user: User; accessToken?: string }>(
                    "/api/auth/refresh-token",
                    { deviceId: getOrCreateDeviceId() },
                    { withCredentials: true }
                )
                .then(({ data }) => applyAuth(data))
                .catch(() => applyAuth())
                .catch(() => {
                    window.dispatchEvent(
                        new CustomEvent(SESSION_EXPIRED_EVENT)
                    );
                });
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(id);
    }, [accessToken, applyAuth]);

    const value = useMemo<AuthContextValue>(
        () => ({
            accessToken,
            user,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError,
        }),
        [accessToken, user, isLoading, error, login, register, logout, clearError]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
