import axios, { AxiosRequestConfig } from "axios"

export const BASE_URL = "http://localhost:3003"
export const API_URL = `${BASE_URL}/api`

interface SessionData {
  user: any
  token: string
  refreshToken: string
  expiresAt: string
}

const SESSION_KEY = "auth-session";

export function getAuthSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as SessionData;
  } catch (err) {
    console.warn("Invalid session in localStorage, clearing...");
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveAuthSession(session: SessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function Server<T>(
  route: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: any
): Promise<T> {
  const session = getAuthSession();
  const token = session?.token || process.env.NEXT_PUBLIC_API_TOKEN;

  const url = `${API_URL}${route.startsWith("/") ? route : `/${route}`}`;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    data: body,
  };

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (err: any) {
    const status = err.response?.status;

    if (status === 401 && session?.refreshToken) {
      try {
        // Attempt token refresh
        const refreshRes = await axios.post<{
          token: string;
          expiresAt: string;
        }>(`${API_URL}/auth/refresh`, { refreshToken: session.refreshToken });

        const newSession: SessionData = {
          ...session,
          token: refreshRes.data.token,
          expiresAt: refreshRes.data.expiresAt,
        };

        saveAuthSession(newSession);

        // Retry original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newSession.token}`,
        };
        const retryRes = await axios.request<T>(config);
        return retryRes.data;
      } catch {
        console.error("Token refresh failed, logging out...");
        clearAuthSession();
        window.location.href = "/auth/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    const message =
      err.response?.data?.message || err.message || `HTTP error! Status: ${status}`;
    console.error("API Axios Error:", message);
    throw new Error(message);
  }
}
