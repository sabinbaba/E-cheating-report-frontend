"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Shield, GraduationCap } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
       await login({ email, password })

  location.href="/";
    } catch (err: any) {
      // Fallback for unexpected errors
      setError(err?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-3">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">E-Cheating Report System</h1>
          <p className="text-muted-foreground text-balance">
            Rwanda Polytechnic - Academic Integrity Management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@rp.ac.rw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm text-muted-foreground text-center">Demo Credentials:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                  <span className="font-mono">admin@rp.ac.rw / admin123</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Lecturer
                  </span>
                  <span className="font-mono">lecturer@rp.ac.rw / lecturer123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
