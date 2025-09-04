"use client"

import { useState, useEffect } from "react"
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
  const isAdmin = user?.role?.toLowerCase() === "admin"

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

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
    displayName: user?.fullName || "",
    email: user?.email || "",
  })

  // Auto-clear messages after 3s
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(""), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const updateSetting = (key: keyof typeof settings, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem("e-cheating-settings", JSON.stringify(settings))
      setMessage("Settings saved successfully!")
    } catch {
      setMessage("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
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

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        console.log("Imported data:", data)
        setMessage("Data imported successfully! (Check console)")
      } catch {
        setMessage("Failed to import data: Invalid JSON")
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("e-cheating-reports")
      localStorage.removeItem("e-cheating-notifications")
      if (isAdmin) {
        localStorage.removeItem("e-cheating-users")
      }
      setMessage("Data cleared successfully!")
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
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
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
                  onChange={(e) => updateSetting("displayName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {isAdmin ? "Administrator" : "Lecturer"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Contact an administrator to change your role
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Email Notifications", key: "emailNotifications", desc: "Receive notifications via email" },
                { label: "Push Notifications", key: "pushNotifications", desc: "Receive browser push notifications" },
                { label: "New Report Notifications", key: "reportNotifications", desc: "Get notified when new reports are submitted" },
                { label: "Status Update Notifications", key: "statusUpdateNotifications", desc: "Get notified when report statuses change" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) => updateSetting(item.key as keyof typeof settings, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab (Admin only) */}
        {isAdmin && (
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
                    <p className="text-sm text-muted-foreground">Automatically assign new reports to staff</p>
                  </div>
                  <Switch
                    checked={settings.autoAssignReports}
                    onCheckedChange={(checked) => updateSetting("autoAssignReports", checked)}
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
                    onCheckedChange={(checked) => updateSetting("requireApproval", checked)}
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
                      updateSetting(
                        "maxReportsPerDay",
                        e.target.value === "" ? 0 : Number.parseInt(e.target.value),
                      )
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

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, or clear your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>

                <Button
                  variant="outline"
                  className="relative flex items-center gap-2 bg-transparent overflow-hidden"
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportData}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
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
