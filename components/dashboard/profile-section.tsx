"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Save, Mail, Calendar, MapPin, Phone } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Server } from "@/lib/api"   // 👈 import your API wrapper

export function ProfileSection() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [profile, setProfile] = useState<any | null>(null)

  // ✅ Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return
        const data = await Server(`/users/me`, "GET")  // <-- adjust route to match your backend
        setProfile(data)
      } catch (err: any) {
        console.error("Failed to fetch profile:", err.message)
        setMessage("Could not load profile")
      }
    }
    fetchProfile()
  }, [user])

  // ✅ Update profile
  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    setMessage("")

    try {
      const updated = await Server(`/users/me`, "PUT", profile) // <-- adjust backend API
      setProfile(updated)
      setMessage("Profile updated successfully!")

      setTimeout(() => setMessage(""), 3000)
    } catch (error: any) {
      console.error(error)
      setMessage(error?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account details</p>
      </div>

      {message && (
        <Alert className="transition-all duration-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profile?.fullName}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Badge variant={profile?.role === "ADMIN" ? "default" : "secondary"}>
                <Shield className="h-3 w-3 mr-1" />
                {profile?.role === "ADMIN" ? "Administrator" : "Lecturer"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{profile?.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{profile?.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {profile?.joinDate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((prev: any) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev: any) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile((prev: any) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profile.department || ""}
                  onChange={(e) =>
                    setProfile((prev: any) => ({ ...prev, department: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profile.position || ""}
                  onChange={(e) =>
                    setProfile((prev: any) => ({ ...prev, position: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ""}
                  onChange={(e) =>
                    setProfile((prev: any) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                placeholder="Tell us about yourself..."
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile((prev: any) => ({ ...prev, bio: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end">
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
