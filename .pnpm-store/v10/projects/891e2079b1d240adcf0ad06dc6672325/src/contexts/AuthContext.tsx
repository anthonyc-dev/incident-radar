/**
 * Auth context for token (cookie)-based authentication.
 * - Hydrates on mount via /api/auth/refresh-token (returns user) for persistent login
 * - Auto-refreshes tokens on an interval
 * - Listens for session-expired (refresh failed) to clear user
 * - Exposes login, logout, user, isLoading, error
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiClient, SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import { getOrCreateDeviceId } from "@/lib/device-id";
import type { LoginCredentials, User } from "@/types/auth.types";

const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 min

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Hydrate on mount: refresh-token returns { user } if cookies are valid. Enables persistent login.
  useEffect(() => {
    apiClient
      .post<{ user: User }>("/api/auth/refresh-token", {
        deviceId: getOrCreateDeviceId(),
      })
      .then(({ data }) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const deviceId = getOrCreateDeviceId();
      const body: LoginCredentials = { email, password, deviceId };

      const { data } = await apiClient.post<{ user: User }>("/api/auth/login", body);
      setUser(data.user);
      setError(null);
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null);
      const deviceId = getOrCreateDeviceId();
      const body = { name, email, password, deviceId };

      const { data } = await apiClient.post<{ user: User }>("/api/auth/register", body);
      setUser(data.user);
      setError(null);
    },
    []
  );

  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);


  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      setError("Session expired. Please sign in again.");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  // Proactive token refresh on an intervals
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      apiClient
        .post("/api/auth/refresh-token", { deviceId: getOrCreateDeviceId() })
        .catch(() => {
          window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

