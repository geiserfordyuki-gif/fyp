"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Eye, EyeOff, Trash2 } from "lucide-react"


interface User {
  id: number
  username: string
  password: string
  role: "student" | "lecturer"
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student" as "student" | "lecturer",
  })
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    setMessage("")


    const existingUser = users.find((user) => user.username.toLowerCase() === newUser.username.toLowerCase())
    if (existingUser) {
      setMessage("Username already exists. Please choose a different username.")
      setIsAdding(false)
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchUsers()
      setNewUser({ username: "", password: "", role: "student" })
        setMessage(`User ${newUser.username} added successfully`)
      } else {
        setMessage(data.error || "Error adding user")
      }
    } catch (error) {
      setMessage("Connection error. Please try again.")
    }

    setIsAdding(false)
  }


  const handleDeleteUser = async (userId: number) => {
    setDeletingUserId(userId)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        await fetchUsers()
        setMessage("User deleted successfully")
      } else {
        setMessage(data.error || "Error deleting user")
      }
    } catch (error) {
      setMessage("Connection error. Please try again.")
    }

    setDeletingUserId(null)
    setConfirmDelete(null)
  }

  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-cyan-400">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-cyan-400" />
          <h2 className="text-3xl font-bold text-cyan-400">USER MANAGEMENT</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New User */}
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                ADD NEW USER
              </CardTitle>
              <CardDescription className="text-gray-400">Create new student or lecturer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cyan-400">USERNAME</label>
                  <Input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                    placeholder="Enter username or email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cyan-400">PASSWORD</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cyan-400">ROLE</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "student" | "lecturer") => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="student" className="text-white hover:bg-gray-700">
                        Student
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {message && (
                  <div
                    className={`text-sm p-2 rounded ${
                      message.includes("successfully")
                        ? "text-green-400 bg-green-900/20 border border-green-500/20"
                        : "text-red-400 bg-red-900/20 border border-red-500/20"
                    }`}
                  >
                    {message}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  {isAdding ? "ADDING USER..." : "ADD USER"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User List */}
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">EXISTING USERS</CardTitle>
              <CardDescription className="text-gray-400">Total users: {users.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{user.username}</span>
                        <Badge
                          variant={user.role === "lecturer" ? "default" : "secondary"}
                          className={
                            user.role === "lecturer" ? "bg-yellow-600 text-yellow-100" : "bg-blue-600 text-blue-100"
                          }
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">ID: {user.id}</span>
                        <span className="text-xs text-gray-400">
                          Password: {showPasswords[user.id] ? user.password : "••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-cyan-400"
                        >
                          {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                      <div className="ml-2">
                      {confirmDelete === user.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                            className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700"
                          >
                            {deletingUserId === user.id ? "..." : "CONFIRM"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDelete(null)}
                            className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                          >
                            CANCEL
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(user.id)}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-400"
                          title="Delete user"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
