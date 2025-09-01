"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(username, password)
    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Invalid username or password")
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900 border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white rounded-sm"></div>
            </div>
            <CardTitle className="text-2xl font-bold text-cyan-400">EDUPOT ACCESS</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the SIEM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-cyan-400">
                  USERNAME
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-cyan-400">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/20 rounded p-2">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded transition-all duration-200"
              >
                {isLoading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
              </Button>
            </form>
            <div className="mt-6 text-xs text-gray-500 text-center">
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
