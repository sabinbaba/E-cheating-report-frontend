"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, AlertTriangle, CheckCircle, Clock, Users, Eye, TrendingUp, Bell } from "lucide-react"
import { reportsService, notificationsService } from "@/lib/reports"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import type { CheatingReport, Notification } from "@/types/report"

export function DashboardOverview() {
  const { user } = useAuth()
  const [reports, setReports] = useState<CheatingReport[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setReports(reportsService.getAllReports())
      setNotifications(notificationsService.getAllNotifications())
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    underReview: reports.filter((r) => r.status === "under_review").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    highPriority: reports.filter((r) => r.priority === "high").length,
  }

  const recentReports = reports.slice(0, 5)
  const recentNotifications = notifications.slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-balance">Welcome back, {user?.name}</h2>
        <p className="text-muted-foreground text-balance">
          Here's an overview of academic integrity reports and system activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{stats.underReview}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Completed cases</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Latest academic integrity incidents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="No academic integrity reports have been submitted recently."
              />
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{report.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{report.course}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          report.status === "pending"
                            ? "secondary"
                            : report.status === "under_review"
                              ? "default"
                              : report.status === "resolved"
                                ? "outline"
                                : "destructive"
                        }
                        className="text-xs"
                      >
                        {report.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={
                          report.priority === "high"
                            ? "destructive"
                            : report.priority === "medium"
                              ? "default"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {report.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2 shrink-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>System updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications"
                description="You're all caught up! No recent notifications to show."
              />
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg transition-colors hover:bg-muted/50"
                >
                  <div className="mt-1 shrink-0">
                    {notification.type === "new_report" ? (
                      <FileText className="h-4 w-4 text-chart-1" />
                    ) : notification.type === "status_update" ? (
                      <AlertTriangle className="h-4 w-4 text-chart-2" />
                    ) : (
                      <Users className="h-4 w-4 text-chart-3" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && <div className="w-2 h-2 bg-chart-1 rounded-full mt-2 shrink-0" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all duration-200 hover:shadow-md light-mode-card">
        <CardHeader>
          <CardTitle>Resolution Progress</CardTitle>
          <CardDescription>Track the progress of report resolutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Resolved Cases</span>
              <span className="font-medium">{Math.round((stats.resolved / stats.total) * 100)}%</span>
            </div>
            <Progress value={(stats.resolved / stats.total) * 100} className="h-2" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Cases Under Review</span>
              <span className="font-medium">{Math.round((stats.underReview / stats.total) * 100)}%</span>
            </div>
            <Progress value={(stats.underReview / stats.total) * 100} className="h-2" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Pending Cases</span>
              <span className="font-medium">{Math.round((stats.pending / stats.total) * 100)}%</span>
            </div>
            <Progress value={(stats.pending / stats.total) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
