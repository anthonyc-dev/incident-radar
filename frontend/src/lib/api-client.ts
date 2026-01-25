/**
 * Central API client for HTTP requests.
 * - Sends cookies (credentials) for cookie-based auth
 * - On 401: attempts refresh-token, retries original request, or dispatches session-expired
 * - Deduplicates concurrent 401s into a single refresh
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getOrCreateDeviceId } from "@/lib/device-id";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const REFRESH_PATH = "/api/auth/refresh-token";
const LOGIN_PATH = "/api/auth/login";
const SESSION_EXPIRED_EVENT = "auth:session-expired";

let refreshPromise: Promise<unknown> | null = null;

function isAuthEndpoint(url: string | undefined, path: string): boolean {
  if (!url) return false;
  const normalized = url.startsWith("http") ? new URL(url).pathname : url;
  return normalized.includes(path);
}

function dispatchSessionExpired(): void {
  try {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  } catch {
    // no-op if outside browser
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const config = err.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (status !== 401 || !config) {
      return Promise.reject(err);
    }

    // Do not intercept refresh or login 401s
    if (
      isAuthEndpoint(config.url, REFRESH_PATH) ||
      isAuthEndpoint(config.url, LOGIN_PATH)
    ) {
      return Promise.reject(err);
    }

    // Avoid retry loops
    if (config._retry) {
      return Promise.reject(err);
    }

    const runRefresh = (): Promise<unknown> => {
      if (refreshPromise) return refreshPromise;
      refreshPromise = apiClient
        .post(REFRESH_PATH, { deviceId: getOrCreateDeviceId() })
        .finally(() => {
          refreshPromise = null;
        });
      return refreshPromise;
    };

    try {
      await runRefresh();
      config._retry = true;
      return apiClient(config);
    } catch {
      dispatchSessionExpired();
      return Promise.reject(err);
    }
  }
);

export { SESSION_EXPIRED_EVENT };
