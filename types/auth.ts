export interface User {
  id: string
  email: string
  fullName: string
  role: "ADMIN" | "LECTURER"
  createdAt: string
  lastLogin?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserData {
  email: string
  fullName: string
  password: string
  role: "LECTURER" | "ADMIN"
}
