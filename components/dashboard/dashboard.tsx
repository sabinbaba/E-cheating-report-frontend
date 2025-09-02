"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { DashboardContent } from "./dashboard-content"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setIsMobileMenuOpen(false) // Close mobile menu when section changes
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          userRole={user?.role || "lecturer"}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center lg:hidden p-4 border-b border-border bg-card">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                userRole={user?.role || "lecturer"}
              />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-card-foreground">E-Cheating Report</h1>
            <p className="text-sm text-muted-foreground">Rwanda Polytechnic</p>
          </div>
        </div>

        <Header onNavigate={handleSectionChange} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <DashboardContent activeSection={activeSection} />
        </main>
      </div>
    </div>
  )
}
