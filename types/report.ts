export interface ReportAttachment {
  id: string
  name: string
  type: string
  size: number
  data: string // base64 encoded file data
  uploadedAt: string
  file: File
}

export interface CheatingReport {
  id: string
  studentName: string
  studentId: string
  courseCode: string
  incidentDate: string
  reportedBy: string
  reporterEmail: string
  incidentType: "exam_cheating" | "assignment_plagiarism" | "unauthorized_collaboration" | "other"
  description: string
  evidence?: string[]
  attachments?: ReportAttachment[]
  status: "pending" | "under_review" | "resolved" | "dismissed"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  assignedTo?: string
}

export interface Notification {
  id: string
  type: "new_report" | "status_update" | "assignment" | "system"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  reportId?: string
}
