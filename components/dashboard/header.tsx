"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { notificationsService } from "@/lib/reports"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useEffect } from "react"

interface HeaderProps {
  onNavigate: (section: string) => void
}

export function Header({ onNavigate }: HeaderProps) {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notificationsService.getUnreadCount())
  }, [])

  const handleNotificationClick = () => {
    onNavigate("overview")
  }

  return (
    <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between light-mode-header">
      <div className="hidden lg:block">
        <h1 className="text-xl font-semibold text-card-foreground">Academic Integrity Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage and monitor cheating reports</p>
      </div>

      <div className="lg:hidden flex-1">
        <h1 className="text-lg font-semibold text-card-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative transition-colors" onClick={handleNotificationClick}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate("profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
