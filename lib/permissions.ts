import type { User } from "@/types/auth"

export const permissions = {
  // Report permissions
  canCreateReport: (user: User | null) => !!user,
  canViewAllReports: (user: User | null) => user?.role === "admin",
  canEditReportStatus: (user: User | null) => user?.role === "admin",
  canDeleteReport: (user: User | null) => user?.role === "admin",

  // User management permissions
  canCreateUser: (user: User | null) => user?.role === "admin",
  canEditUser: (user: User | null) => user?.role === "admin",
  canDeleteUser: (user: User | null) => user?.role === "admin",
  canViewUsers: (user: User | null) => user?.role === "admin",

  // Analytics permissions
  canViewAnalytics: (user: User | null) => user?.role === "admin",
  canExportData: (user: User | null) => user?.role === "admin",

  // System settings permissions
  canModifySystemSettings: (user: User | null) => user?.role === "admin",
  canManageNotifications: (user: User | null) => !!user,

  // Notification permissions
  canSendNotifications: (user: User | null) => user?.role === "admin",
  canViewAllNotifications: (user: User | null) => !!user,
} as const

export const usePermissions = (user: User | null) => {
  return {
    canCreateReport: permissions.canCreateReport(user),
    canViewAllReports: permissions.canViewAllReports(user),
    canEditReportStatus: permissions.canEditReportStatus(user),
    canDeleteReport: permissions.canDeleteReport(user),
    canCreateUser: permissions.canCreateUser(user),
    canEditUser: permissions.canEditUser(user),
    canDeleteUser: permissions.canDeleteUser(user),
    canViewUsers: permissions.canViewUsers(user),
    canViewAnalytics: permissions.canViewAnalytics(user),
    canExportData: permissions.canExportData(user),
    canModifySystemSettings: permissions.canModifySystemSettings(user),
    canManageNotifications: permissions.canManageNotifications(user),
    canSendNotifications: permissions.canSendNotifications(user),
    canViewAllNotifications: permissions.canViewAllNotifications(user),
  }
}
