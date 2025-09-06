export interface ReportAttachment {
  id: string
  name: string
  type: string
  mimetype: string
  original:string
  size: number
  data: string // base64 encoded file data
  uploadedAt: string
  file: File
}
export interface Witnesses{
  name: string
  registrationNumber:string
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
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  createdAt: string
  updatedAt: string
  assignedTo?: string
  witnesses: Witnesses[]
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
