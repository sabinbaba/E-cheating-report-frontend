import type { CheatingReport, Notification } from "@/types/report"
import { Server } from "./api"

export const reportsService = {
getAllReports: async (page = 1, limit = 10): Promise<{
  data: CheatingReport[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  return await Server("/reports", "GET", { page, limit });
},


  getReportById: async (id: string): Promise<CheatingReport | null> => {
    try {
      return await Server<CheatingReport>(`/reports/${id}`, "GET", {})
    } catch {
      return null
    }
  },

  createReport: async (
formPayload: FormData, p0: { headers: { "Content-Type": string } }, reportData: Omit<CheatingReport, "id" | "createdAt" | "updatedAt">  ): Promise<CheatingReport> => {
    return await Server<CheatingReport>("/reports", "POST", reportData)
  },

  updateReportStatus: async (
    id: string,
    status: CheatingReport["status"]
  ): Promise<CheatingReport | null> => {
    return await Server<CheatingReport>(`/reports/${id}/status`, "PATCH", { status })
  },
}

export const notificationsService = {
  getAllNotifications: async (): Promise<Notification[]> => {
    return await Server<Notification[]>("/notifications", "GET", {})
  },

  getUnreadCount: async (): Promise<number> => {
    const notifications = await notificationsService.getAllNotifications()
    return notifications.filter((n) => !n.isRead).length
  },

  markAsRead: async (id: string): Promise<void> => {
    await Server(`/notifications/${id}/read`, "PATCH", {})
  },

  markAllAsRead: async (): Promise<void> => {
    await Server(`/notifications/read-all`, "PATCH", {})
  },
}
