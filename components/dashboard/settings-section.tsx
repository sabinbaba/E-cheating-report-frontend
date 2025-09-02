"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Save, Download, Upload, Trash2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function SettingsSection() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Settings state
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    reportNotifications: true,
    statusUpdateNotifications: true,

    // System settings (admin only)
    autoAssignReports: false,
    requireApproval: true,
    maxReportsPerDay: 50,

    // Profile settings
    displayName: user?.name || "",
    email: user?.email || "",
  })

  const handleSave = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      // In a real app, this would save to backend
      localStorage.setItem("e-cheating-settings", JSON.stringify(settings))
      setMessage("Settings saved successfully!")

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    // Export user data
    const reports = localStorage.getItem("e-cheating-reports")
    const users = localStorage.getItem("e-cheating-users")
    const notifications = localStorage.getItem("e-cheating-notifications")

    const exportData = {
      reports: reports ? JSON.parse(reports) : [],
      users: users ? JSON.parse(users) : [],
      notifications: notifications ? JSON.parse(notifications) : [],
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `e-cheating-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("e-cheating-reports")
      localStorage.removeItem("e-cheating-notifications")
      if (user?.role === "admin") {
        localStorage.removeItem("e-cheating-users")
      }
      setMessage("Data cleared successfully!")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and system preferences</p>
      </div>

      {message && (
        <Alert className="transition-all duration-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {user?.role === "admin" && <TabsTrigger value="system">System</TabsTrigger>}
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, displayName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role === "admin" ? "Administrator" : "Lecturer"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Contact an administrator to change your role</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Report Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new reports are submitted</p>
                </div>
                <Switch
                  checked={settings.reportNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, reportNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status Update Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when report statuses change</p>
                </div>
                <Switch
                  checked={settings.statusUpdateNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, statusUpdateNotifications: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-assign Reports</Label>
                    <p className="text-sm text-muted-foreground">Automatically assign new reports to available staff</p>
                  </div>
                  <Switch
                    checked={settings.autoAssignReports}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoAssignReports: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">Require admin approval before resolving reports</p>
                  </div>
                  <Switch
                    checked={settings.requireApproval}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, requireApproval: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="maxReports">Maximum Reports Per Day</Label>
                  <Input
                    id="maxReports"
                    type="number"
                    value={settings.maxReportsPerDay}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, maxReportsPerDay: Number.parseInt(e.target.value) || 50 }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Limit the number of reports that can be submitted per day
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, or clear your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>

                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <Button
                      onClick={handleClearData}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end sticky bottom-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
