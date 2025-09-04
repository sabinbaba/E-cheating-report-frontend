"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, FileText, Users, Bell, Settings, Shield, GraduationCap, BarChart3 } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userRole: "ADMIN" | "LECTURER"
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "LECTURER"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    roles: ["ADMIN", "LECTURER"],
    badge: "3",
  },
  {
    id: "profile",
    label: "Profile",
    icon: Users,
    roles: ["ADMIN", "LECTURER"],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["ADMIN", "LECTURER"],
    badge: "2",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    roles: ["ADMIN", "LECTURER"],
  },
]

export function Sidebar({ activeSection, onSectionChange, userRole }: SidebarProps) {
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full light-mode-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-accent rounded-lg p-2 transition-colors">
            <Shield className="h-6 w-6 text-sidebar-accent-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">E-Cheating Report</h2>
            <p className="text-sm text-muted-foreground">Rwanda Polytechnic</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11 transition-all duration-200",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                !isActive && "hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {/* {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )} */}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 bg-sidebar-primary rounded-lg transition-colors">
          <div className="bg-sidebar-accent rounded-full p-2">
            {userRole === "ADMIN" ? (
              <Shield className="h-4 w-4 text-sidebar-accent-foreground" />
            ) : (
              <GraduationCap className="h-4 w-4 text-sidebar-accent-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-primary-foreground capitalize">{userRole}</p>
            <p className="text-xs text-muted-foreground truncate">Logged in</p>
          </div>
        </div>
      </div>
    </div>
  )
}
