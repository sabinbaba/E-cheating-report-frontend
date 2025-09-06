"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  User,
  Mail,
  BookOpen,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileText,
  ImageIcon,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { CheatingReport } from "@/types/report"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { BASE_URL } from "@/lib/api"

interface ReportDetailsDialogProps {
  report: CheatingReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (reportId: string, status: CheatingReport["status"]) => void
}

export function ReportDetailsDialog({
  report,
  open,
  onOpenChange,
  onStatusUpdate,
}: ReportDetailsDialogProps) {
  const { user } = useAuth()

  if (!report) return null

  const getStatusBadge = (status: CheatingReport["status"]) => {
    const variants = {
      PENDING: "secondary",
      UNDER_REVIEW: "default",
      RESOLVED: "outline",
      DISMISSED: "destructive",
    } as const
    return <Badge variant={variants[status]}>{status.replace("_", " ")}</Badge>
  }

  const getPriorityBadge = (priority: CheatingReport["priority"]) => {
    const variants = {
      LOW: "outline",
      MEDIUM: "default",
      HIGH: "destructive",
    } as const
    return <Badge variant={variants[priority]}>{priority}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type?: string) => {
    // Safely handle undefined or null type
    if (!type) return <FileText className="h-4 w-4" />
    return type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />
  }

const downloadAttachment = (attachment: any) => {
  const filename = attachment.filename || attachment.original;
  const link = document.createElement("a");
  link.href = `${BASE_URL}/api/uploads/${filename}`;
  link.download = attachment.name || attachment.original || 'attachment';
  link.target = '_blank'; // Open in new tab for download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const previewAttachment = (attachment: any) => {
  const filename = attachment.filename || attachment.original;
  const type = attachment.type || attachment.mimetype || '';
  const url = `${BASE_URL}/api/uploads/${filename}`;
  
  if (type.startsWith("image/") || filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
    window.open(url, "_blank");
  } else if (type.includes('pdf') || filename.match(/\.pdf$/i)) {
    window.open(url, "_blank");
  } else {
    downloadAttachment(attachment);
  }
}

  const handlePrint = async () => {
    const response = await fetch(`${BASE_URL}/api/reports/${report.id}/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${report.id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>Academic integrity incident report #{report.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(report.status)}
              {getPriorityBadge(report.priority)}
            </div>
            {user?.role === "ADMIN" && (
              <Select
                value={report.status}
                onValueChange={(value) => onStatusUpdate(report.id, value as CheatingReport["status"])}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator />

          {/* Student Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{report.studentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium">{report.studentId}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Incident Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Incident Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{report.courseCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(report.incidentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{report.incidentType.replace("_", " ")}</Badge>
                </div>
              </div>
              {report.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{report.assignedTo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reporter Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Reporter Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{report.reportedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{report.reporterEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Description</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{report.description}</p>
            </div>
          </div>

          {/* Witnesses */}
          {report.witnesses && report.witnesses.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Witnesses</h3>
                <ul className="list-disc list-inside">
                  {report.witnesses.map((w) => (
                    <li key={w.registrationNumber}>
                      {w.name} ({w.registrationNumber})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Evidence Attachments</h3>
                <div className="space-y-3">
                  {report.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(attachment.type || attachment.mimetype)}
                        <div>
                          <p className="text-sm font-medium">{attachment.name || attachment.original}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size || 0)} • {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => previewAttachment(attachment)} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadAttachment(attachment)} className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(report.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>Print / Export PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}