"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Monitor, Settings, Shield, Target, Users, Bell, RefreshCw, Activity, LogOut, UserPlus, Key,  MessageSquare,} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "../lib/auth-context"
import TrafficPage from "./traffic/page"
import HomePage from "./home/page"
import IntelligencePage from "./Intelligence/page"
import UserManagement from "../components/user-management"
import ChangePassword from "../components/change-password"
import ForumPage from "./forum/page" // Added ForumPage import

export default function TacticalDashboard() {
  const [activeSection, setActiveSection] = useState("HomePage")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400">AUTHENTICATING...</div>
      </div>
    )
  }

  const getNavigationItems = () => {
  const baseItems = [              
      { id: "HomePage", icon: Target, label: "HOME" },
      { id: "Traffic", icon: Activity, label: "Traffic" },
      { id: "intelligence", icon: Shield, label: "INTELLIGENCE" },
      { id: "forum", icon: MessageSquare, label: "FORUM" }, // Added forum navigation item
    ]

    const roleSpecificItems = []

    if (user?.role === "lecturer") {
      roleSpecificItems.push({ id: "user-management", icon: UserPlus, label: "USER MANAGEMENT" })
    }

    if (user?.role === "student") {
      roleSpecificItems.push({ id: "change-password", icon: Key, label: "CHANGE PASSWORD" })
    }

    return [...baseItems, ...roleSpecificItems]
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">Edupot</h1>
              <p className="text-neutral-500 text-xs">FOR EDUCATION</p>
                <div className="mt-2 text-xs">
                <div className="text-cyan-400">USER: {user?.username}</div>
                <div className={`text-neutral-500 ${user?.role === "lecturer" ? "text-yellow-400" : "text-blue-400"}`}>
                  ROLE: {user?.role?.toUpperCase()}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {getNavigationItems().map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <>
              <div className="mt-4">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">LOGOUT</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}
 
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              EDUPOT /{" "}
              <span className="text-orange-500">{activeSection.toUpperCase().replace("-", " ")}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === "Traffic" && <TrafficPage />}
          {activeSection === "HomePage" && <HomePage />}
          {activeSection === "intelligence" && <IntelligencePage />}
          {activeSection === "forum" && <ForumPage />}
          {activeSection === "user-management" && user?.role === "lecturer" && <UserManagement />}
          {activeSection === "change-password" && user?.role === "student" && <ChangePassword />}
        </div>
      </div>
    </div>
  )
}
