import type { User, LoginCredentials, CreateUserData } from "@/types/auth"
import { Server } from "./api"
type LoginResult =
  | { user: User; token: string; refreshToken?: string }
  | { error: string };

const STORAGE_KEYS = {
  USER: "e-cheating-user",
  TOKEN: "e-cheating-token",
} as const
const SESSION_KEY = "auth-session";

interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: string;
}

function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession(): AuthSession | null {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export const authService = {
  // 🔑 Login via API
login: async (credentials: LoginCredentials): Promise<LoginResult> => {
  if (!credentials.email || !credentials.password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await Server<{
      token: string;
      message?: string;
      user: User;
      refreshToken?: string;
    }>("/auth/login", "POST", credentials);

    if (!response?.token || !response?.user) {
      throw { error: response?.message || "Invalid email or password" };
    }

    const updatedUser = {
      ...response.user,
      lastLogin: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    const session: AuthSession = {
      user: updatedUser,
      token: response.token,
      refreshToken: response?.refreshToken,
    };

    saveSession(session);

    return { user: updatedUser, token: response.token, refreshToken: response?.refreshToken };
  } catch (error: any) {
    throw { error: error instanceof Error ? error.message : "Login failed" };
  }
},

  // 🚪 Logout clears user + token
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  },

  // 👤 Get user from storage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    return userStr ? JSON.parse(userStr) : null
  },

  // 🆕 Create user via API
  createUser: async (userData: CreateUserData): Promise<User> => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    // if (!token) throw new Error("Not authenticated")

    const response = await Server<{ user: User }>(
      "/auth/register",
      "POST",
      userData,
    )

    return response.user
  },

  // 📋 Get all users via API (admin only)
  getAllUsers: async (): Promise<User[]> => {
    // const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    // if (!token) throw new Error("Not authenticated")

    const response = await Server<User[]>(
      "/auth",
      "GET",{})

    return response
  },
}
