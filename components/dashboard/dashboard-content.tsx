"use client"

import { DashboardOverview } from "./dashboard-overview"
import { ReportsSection } from "./reports-section"
import { NotificationsSection } from "./notifications-section"
import { UsersSection } from "./users-section"
import { AnalyticsSection } from "./analytics-section"
import { SettingsSection } from "./settings-section"
import { ProfileSection } from "./profile-section"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  switch (activeSection) {
    case "dashboard":
      return <DashboardOverview />
    case "reports":
      return <ReportsSection />
    case "profile":
      return <ProfileSection />
    case "notifications":
      return <NotificationsSection />
    case "users":
      return <UsersSection />
    case "analytics":
      return <AnalyticsSection />
    case "settings":
      return <SettingsSection />
    default:
      return <DashboardOverview />
  }
}
