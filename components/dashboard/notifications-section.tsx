"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, FileText, AlertTriangle, Users, Settings } from "lucide-react"
import { notificationsService } from "@/lib/reports"
import type { Notification } from "@/types/report"

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationsService.getAllNotifications()
        setNotifications(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        setNotifications([])
      }
    }

    fetchNotifications()
  }, [])

  // Handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      const updated = await notificationsService.getAllNotifications()
      setNotifications(Array.isArray(updated) ? updated : [])
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      const updated = await notificationsService.getAllNotifications()
      setNotifications(Array.isArray(updated) ? updated : [])
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  // Derived lists
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  // Icon mapper
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_report":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "status_update":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "assignment":
        return <Users className="h-4 w-4 text-green-500" />
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Notification card component
  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`${!notification.isRead ? "border-blue-200 bg-blue-50/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
              {!notification.isRead && (
                <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">Stay updated with system alerts and report updates</p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadNotifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readNotifications.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unread" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Unread
            {unreadNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">You have no unread notifications.</p>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
