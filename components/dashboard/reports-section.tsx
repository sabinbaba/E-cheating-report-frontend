"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Download } from "lucide-react"
import { reportsService } from "@/lib/reports"
import { useAuth } from "@/hooks/use-auth"
import type { CheatingReport } from "@/types/report"
import { CreateReportForm } from "./create-report-form"
import { ReportDetailsDialog } from "./report-details-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { FileText } from "lucide-react"

export function ReportsSection() {
  const { user } = useAuth()
  const [reports, setReports] = useState<CheatingReport[]>([])
  const [filteredReports, setFilteredReports] = useState<CheatingReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<CheatingReport | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

const loadReports = async () => {
  setIsLoading(true)
  try {
    const response = await reportsService.getAllReports(page, pageSize)

    const reportsArray = Array.isArray(response.data) ? response.data : []
    setReports(reportsArray)
    setFilteredReports(reportsArray)

    setTotalPages(response.pagination?.totalPages || 1)
  } catch (error) {
    console.error("Failed to fetch reports:", error)
    setReports([])
    setFilteredReports([])
    setTotalPages(1)
  } finally {
    setIsLoading(false)
  }
}


  useEffect(() => {
    loadReports()
  }, [page])

  useEffect(() => {
    if (!Array.isArray(reports)) return setFilteredReports([])

    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((report) => report.priority === priorityFilter)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, priorityFilter])

  const handleStatusUpdate = async (reportId: string, newStatus: CheatingReport["status"]) => {
    try {
      const updatedReport = await reportsService.updateReportStatus(reportId, newStatus)
      if (updatedReport) {
        const updatedReports = reports.map((report) =>
          report.id === reportId ? updatedReport : report
        )
        setReports(updatedReports)
        setFilteredReports(updatedReports)
      }
    } catch (error) {
      console.error("Failed to update report status:", error)
    }
  }

  const handleViewReport = (report: CheatingReport) => {
    setSelectedReport(report)
    setIsDetailsDialogOpen(true)
  }

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

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "PENDING").length,
    underReview: reports.filter((r) => r.status === "UNDER_REVIEW").length,
    resolved: reports.filter((r) => r.status === "RESOLVED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header + Create Report */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports Management</h2>
          <p className="text-muted-foreground">View and manage academic integrity reports</p>
        </div>
        {user?.role !== "ADMIN" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-fit max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>Submit a new academic integrity incident report</DialogDescription>
              </DialogHeader>
              <CreateReportForm 
                onSuccess={async () => {
                  setIsCreateDialogOpen(false)
                  await loadReports()
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      {/* (keep same as before, omitted here for brevity) */}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <CardDescription>Manage and track academic integrity incidents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No reports found"
              description="No reports match your current filters. Try adjusting your search criteria."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">courseCode</TableHead>
                      <TableHead className="hidden lg:table-cell">Type</TableHead>
                      <TableHead className="hidden xl:table-cell">Reported By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{report.studentName}</p>
                            <p className="text-xs text-muted-foreground">{report.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{report.courseCode}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {report.incidentType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">{report.reportedBy}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{getPriorityBadge(report.priority)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(report.incidentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user?.role === "ADMIN" && (
                              <Select
                                value={report.status}
                                onValueChange={(value) =>
                                  handleStatusUpdate(report.id, value as CheatingReport["status"])
                                }
                              >
                                <SelectTrigger className="w-24 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="under_review">Review</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="dismissed">Dismissed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ✅ Pagination */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ReportDetailsDialog 
        report={selectedReport}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
