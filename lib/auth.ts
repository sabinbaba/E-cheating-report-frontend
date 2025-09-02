import type { User, LoginCredentials, CreateUserData } from "@/types/auth"

const STORAGE_KEYS = {
  USER: "e-cheating-user",
  USERS: "e-cheating-users",
} as const

// Initialize default admin user if not exists
const initializeDefaultUsers = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS)
  if (!existingUsers) {
    const defaultUsers: User[] = [
      {
        id: "1",
        email: "admin@rp.ac.rw",
        name: "System Administrator",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "lecturer@rp.ac.rw",
        name: "John Lecturer",
        role: "lecturer",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers))
  }
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    initializeDefaultUsers()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
    const user = users.find((u) => u.email === credentials.email)

    // Simple password check (in real app, this would be hashed)
    const validCredentials = [
      { email: "admin@rp.ac.rw", password: "admin123" },
      { email: "lecturer@rp.ac.rw", password: "lecturer123" },
    ]

    const isValidPassword = validCredentials.some(
      (cred) => cred.email === credentials.email && cred.password === credentials.password,
    )

    if (!user || !isValidPassword) {
      throw new Error("Invalid email or password")
    }

    const updatedUser = { ...user, lastLogin: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))

    return updatedUser
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    return userStr ? JSON.parse(userStr) : null
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    initializeDefaultUsers()

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")

    // Check if user already exists
    if (users.some((u) => u.email === userData.email)) {
      throw new Error("User with this email already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

    return newUser
  },

  getAllUsers: (): User[] => {
    initializeDefaultUsers()
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]")
  },
}
