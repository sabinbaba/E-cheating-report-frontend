export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "lecturer"
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
  name: string
  password: string
  role: "admin" | "lecturer"
}
