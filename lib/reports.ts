import type { CheatingReport, Notification } from "@/types/report"

const STORAGE_KEYS = {
  REPORTS: "e-cheating-reports",
  NOTIFICATIONS: "e-cheating-notifications",
} as const

// Initialize sample data
const initializeSampleData = () => {
  const existingReports = localStorage.getItem(STORAGE_KEYS.REPORTS)
  const existingNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)

  if (!existingReports) {
    const sampleReports: CheatingReport[] = [
      {
        id: "1",
        studentName: "John Doe",
        studentId: "22RP01234",
        course: "Database Management Systems",
        incidentDate: "2024-12-15",
        reportedBy: "Dr. Smith",
        reporterEmail: "smith@rp.ac.rw",
        incidentType: "exam_cheating",
        description: "Student was observed using unauthorized materials during the final exam.",
        status: "pending",
        priority: "high",
        createdAt: "2024-12-15T10:30:00Z",
        updatedAt: "2024-12-15T10:30:00Z",
      },
      {
        id: "2",
        studentName: "Jane Smith",
        studentId: "22RP01567",
        course: "Web Development",
        incidentDate: "2024-12-14",
        reportedBy: "Prof. Johnson",
        reporterEmail: "johnson@rp.ac.rw",
        incidentType: "assignment_plagiarism",
        description: "Assignment submission shows 85% similarity with online sources.",
        status: "under_review",
        priority: "medium",
        createdAt: "2024-12-14T14:20:00Z",
        updatedAt: "2024-12-15T09:15:00Z",
        assignedTo: "Academic Committee",
      },
      {
        id: "3",
        studentName: "Mike Wilson",
        studentId: "22RP01890",
        course: "Software Engineering",
        incidentDate: "2024-12-13",
        reportedBy: "Dr. Brown",
        reporterEmail: "brown@rp.ac.rw",
        incidentType: "unauthorized_collaboration",
        description: "Multiple students submitted identical code solutions.",
        status: "resolved",
        priority: "low",
        createdAt: "2024-12-13T16:45:00Z",
        updatedAt: "2024-12-14T11:30:00Z",
      },
    ]
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(sampleReports))
  }

  if (!existingNotifications) {
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: "new_report",
        title: "New Cheating Report",
        message: "A new report has been submitted for John Doe in Database Management Systems",
        isRead: false,
        createdAt: "2024-12-15T10:30:00Z",
        reportId: "1",
      },
      {
        id: "2",
        type: "status_update",
        title: "Report Status Updated",
        message: "Report for Jane Smith has been moved to under review",
        isRead: false,
        createdAt: "2024-12-15T09:15:00Z",
        reportId: "2",
      },
      {
        id: "3",
        type: "system",
        title: "System Maintenance",
        message: "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM",
        isRead: true,
        createdAt: "2024-12-14T18:00:00Z",
      },
    ]
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(sampleNotifications))
  }
}

export const reportsService = {
  getAllReports: (): CheatingReport[] => {
    initializeSampleData()
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || "[]")
  },

  getReportById: (id: string): CheatingReport | null => {
    const reports = reportsService.getAllReports()
    return reports.find((report) => report.id === id) || null
  },

  createReport: (reportData: Omit<CheatingReport, "id" | "createdAt" | "updatedAt">): CheatingReport => {
    const reports = reportsService.getAllReports()
    const newReport: CheatingReport = {
      ...reportData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    reports.push(newReport)
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
    return newReport
  },

  updateReportStatus: (id: string, status: CheatingReport["status"]): CheatingReport | null => {
    const reports = reportsService.getAllReports()
    const reportIndex = reports.findIndex((report) => report.id === id)
    if (reportIndex === -1) return null

    reports[reportIndex] = {
      ...reports[reportIndex],
      status,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
    return reports[reportIndex]
  },
}

export const notificationsService = {
  getAllNotifications: (): Notification[] => {
    initializeSampleData()
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]")
  },

  getUnreadCount: (): number => {
    const notifications = notificationsService.getAllNotifications()
    return notifications.filter((n) => !n.isRead).length
  },

  markAsRead: (id: string): void => {
    const notifications = notificationsService.getAllNotifications()
    const notificationIndex = notifications.findIndex((n) => n.id === id)
    if (notificationIndex !== -1) {
      notifications[notificationIndex].isRead = true
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
    }
  },

  markAllAsRead: (): void => {
    const notifications = notificationsService.getAllNotifications()
    notifications.forEach((n) => (n.isRead = true))
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
  },
}
