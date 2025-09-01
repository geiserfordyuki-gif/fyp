"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Eye, EyeOff, Shield } from "lucide-react"
import { useAuth } from "../lib/auth-context"

export default function ChangePassword() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isChanging, setIsChanging] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 5) {
      newErrors.newPassword = "New password must be at least 5 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChanging(true)
    setMessage("")

    if (!validateForm()) {
      setIsChanging(false)
      return
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.ID,
          username: user?.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Password changed successfully")
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setErrors({})
      } else {
        if (data.error === "Current password is incorrect") {
          setErrors({ currentPassword: data.error })
        } else {
          setMessage(data.error || "Failed to change password")
        }
      }
    } catch (error) {
      setMessage("Connection error. Please try again.")
    }

    setIsChanging(false)
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 5) return { strength: 1, label: "Weak", color: "text-red-400" }
    if (password.length < 8) return { strength: 2, label: "Fair", color: "text-yellow-400" }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: "Strong", color: "text-green-400" }
    }
    return { strength: 2, label: "Good", color: "text-blue-400" }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-8 h-8 text-cyan-400" />
          <h2 className="text-3xl font-bold text-cyan-400">CHANGE PASSWORD</h2>
        </div>

        <Card className="bg-gray-900 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              SECURITY UPDATE
            </CardTitle>
            <CardDescription className="text-gray-400">
              Update your account password for enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-400">CURRENT PASSWORD</label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 pr-10"
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-cyan-400"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.currentPassword && <p className="text-red-400 text-sm">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-400">NEW PASSWORD</label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 pr-10"
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-cyan-400"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {formData.newPassword && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-8 rounded ${
                            level <= passwordStrength.strength
                              ? passwordStrength.strength === 1
                                ? "bg-red-400"
                                : passwordStrength.strength === 2
                                  ? "bg-yellow-400"
                                  : "bg-green-400"
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</span>
                  </div>
                )}
                {errors.newPassword && <p className="text-red-400 text-sm">{errors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-400">CONFIRM NEW PASSWORD</label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 pr-10"
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-cyan-400"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`text-sm p-3 rounded border ${
                    message.includes("successfully")
                      ? "text-green-400 bg-green-900/20 border-green-500/20"
                      : "text-red-400 bg-red-900/20 border-red-500/20"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isChanging}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isChanging ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
              </Button>
            </form>

            {/* Security Tips */}
            <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded">
              <h4 className="text-cyan-400 text-sm font-medium mb-2">SECURITY TIPS</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Use at least 8 characters with mixed case letters</li>
                <li>• Include numbers and special characters</li>
                <li>• Avoid using personal information</li>
                <li>• Don't reuse passwords from other accounts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
