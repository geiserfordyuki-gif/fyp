"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin, Clock, ChevronDown } from "lucide-react"
import { useAuth } from "../../lib/auth-context"

interface HoneypotCommand {
  id: number
  timestamp: string
  session_id: string
  source_ip: string
  source_port: number
  username: string
  command: string
  sec_label: string
  sec_conf: number
  cat_label: string
  cat_conf: number
  Requirereview: number
}

export default function IntelligencePage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCommand, setSelectedCommand] = useState<HoneypotCommand | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSecLabel, setSelectedSecLabel] = useState("")
  const [selectedSourceIp, setSelectedSourceIp] = useState<string>("")
  const [commands, setCommands] = useState<HoneypotCommand[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [sourceIps, setSourceIPs] = useState<string[]>([])
  const [securityLabels, setSecurityLabels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [editSecLabel, setEditSecLabel] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editReviewStatus, setEditReviewStatus] = useState(0) 
  const [postDescription, setPostDescription] = useState("")

  useEffect(() => {
    fetchCommands()
    fetchFilters()

      // Debug user ID
    console.log("DEBUG user object:", user);
    console.log("DEBUG user ID:", user?.ID);
  }, [user]); // <-- add `user` as dependency so it logs when user is available

  const fetchCommands = async () => {
    try {
      const response = await fetch("/api/honeypot/commands")
      const data = await response.json()
      if (response.ok) {
        setCommands(data.commands)
      }
    } catch (error) {
      console.error("Error fetching commands:", error)
    } finally {
      setIsLoading(false)
    }
  }

  //Filter
  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/honeypot/filters")
      const data = await response.json()
      if (response.ok) {
        setCategories(data.catLabels)      // fix naming
        setSecurityLabels(data.secLabels)  // fix naming
        setSourceIPs(data.sourceIPs)
      }
    } catch (error) {
      console.error("Error fetching filters:", error)
    }
  }

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await fetch(`/api/honeypot/commands?search=${encodeURIComponent(searchTerm)}`)
        const data = await response.json()
        if (response.ok) {
          setCommands(data.commands)
        }
      } catch (error) {
        console.error("Error searching commands:", error)
      }
    } else {
      fetchCommands()
    }
    setShowSearch(false)
  }

  const handleFilter = async (category: string, secLabel: string, sourceIp: string) => {
    setSelectedCategory(category)
    setSelectedSecLabel(secLabel)
    setSelectedSourceIp(sourceIp)

    try {
      const params = new URLSearchParams()
      if (category) params.append("catLabel", category)   // match backend query param
      if (secLabel) params.append("secLabel", secLabel)
      if (sourceIp) params.append("sourceIp", sourceIp)

      const response = await fetch(`/api/honeypot/commands?${params.toString()}`)
      const data = await response.json()
      if (response.ok) {
        setCommands(data.commands)
      }
    } catch (error) {
      console.error("Error filtering commands:", error)
    }
    setShowFilter(false)
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedSecLabel("")
    setSelectedSourceIp("")
    fetchCommands()
  }


  const getReviewStatus = (Requirereview: number) => {
    switch (Requirereview) {
      case 0:
        return { text: "NO REVIEW", color: "bg-neutral-500/20 text-neutral-300" }
      case 1:
        return { text: "REVIEW REQUIRED", color: "bg-orange-500/20 text-orange-500" }
      case 2:
        return { text: "REVIEW COMPLETED", color: "bg-green-500/20 text-green-500" }
      default:
        return { text: "UNKNOWN", color: "bg-neutral-500/20 text-neutral-300" }
    }
  }

  const handleEditCommand = async () => {
    if (!selectedCommand) return

    try {
      const response = await fetch(`/api/honeypot/commands/${selectedCommand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sec_label: editSecLabel,
          cat_label: editCategory,
          Requirereview: 2, // Always set to 2 (completed) after editing
        }),
      })

      if (response.ok) {
        fetchCommands()
        setShowEditModal(false)
        setSelectedCommand(null)
      }
    } catch (error) {
      console.error("Error updating command:", error)
    }
  }

  const handleDeleteCommand = async () => {
    if (!selectedCommand) return

    if (confirm("Are you sure you want to delete this command?")) {
      try {
        const response = await fetch(`/api/honeypot/commands/${selectedCommand.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchCommands()
          setSelectedCommand(null)
        }
      } catch (error) {
        console.error("Error deleting command:", error)
      }
    }
  }

  const handleMarkAsReviewed = async () => {
    if (!selectedCommand) return

    try {
      const response = await fetch(`/api/honeypot/commands/${selectedCommand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirereview: 2, // Mark as reviewed
        }),
      })

      if (response.ok) {
        fetchCommands()
        setSelectedCommand(null)
      }
    } catch (error) {
      console.error("Error marking as reviewed:", error)
    }
  }

  const handlePostToForum = async () => {
    if (!selectedCommand || !postDescription.trim()) return;

    // Explicitly log the payload
    const payload = {
      userid: user?.ID,
      command: selectedCommand.command,
      description: postDescription,
      attacktype: selectedCommand.cat_label,
    };
    console.log("DEBUG: Forum post payload:", payload);

    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowPostModal(false);
        setPostDescription("");
        setSelectedCommand(null);
        alert("Successfully posted to forum!");
      }
    } catch (error) {
      console.error("Error posting to forum:", error);
    }
  };


  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-cyan-400">Loading commands...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">
            Agent Network — User ID: {user?.ID ?? "Not loaded"}
          </h1>
          <p className="text-sm text-neutral-400">Monitor honeypot command activities</p>
        </div>
          <div className="flex gap-2">
          <Button onClick={() => setShowSearch(!showSearch)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
                    <div className="relative">
            <Button onClick={() => setShowFilter(!showFilter)} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-lg p-4 z-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-neutral-400 tracking-wider mb-2 block">CATEGORY</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-600 text-white text-sm rounded px-3 py-2 max-h-40 overflow-y-auto"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 tracking-wider mb-2 block">SECURITY LABEL</label>
                    <select
                      value={selectedSecLabel}
                      onChange={(e) => setSelectedSecLabel(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-600 text-white text-sm rounded px-3 py-2 max-h-40 overflow-y-auto"
                    >
                      <option value="">All Labels</option>
                      {securityLabels.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="text-xs text-neutral-400 tracking-wider mb-2 block max-h-40 overflow-y-auto">Unique IPS</label>
                  <select
                    value={selectedSourceIp}
                    onChange={(e) => setSelectedSourceIp(e.target.value)}
                  >
                    <option value="">All Source IPs</option>
                    {sourceIps.map((ip) => (
                      <option key={ip} value={ip}>
                        {ip}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleFilter(selectedCategory, selectedSecLabel, selectedSourceIp)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                    >
                      Apply
                    </Button>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 text-xs px-3 py-1 bg-transparent"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search commands, IPs, labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            SSH COMMAND LIST ({commands.length} commands)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-neutral-900">
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">COMMAND</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">CATEGORY</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">SOURCE IP</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">TIMESTAMP</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">SECURITY</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">REVIEW STATUS</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((cmd, index) => (
                  <tr key={cmd.id}
                    className={`border-b border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-neutral-900" : "bg-neutral-850"
                    }`}
                    onClick={() => setSelectedCommand(cmd)}
                  >
                    <td className="py-3 px-4 text-sm text-white font-mono">{cmd.id}</td>
                    <td className="py-3 px-4 text-sm text-white font-mono max-w-xs truncate">{cmd.command}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 rounded bg-neutral-700 text-neutral-300 uppercase tracking-wider">
                        {cmd.cat_label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="text-sm text-neutral-300 font-mono">{cmd.source_ip}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span className="text-sm text-neutral-300 font-mono">{cmd.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${
                          cmd.sec_label === "Malicious"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {cmd.sec_label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                       className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${getReviewStatus(cmd.Requirereview).color}`}
                      >
                        {getReviewStatus(cmd.Requirereview).text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showEditModal && selectedCommand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white tracking-wider">Edit Command</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 tracking-wider mb-2 block">SECURITY LABEL</label>
                <select
                  value={editSecLabel}
                  onChange={(e) => setEditSecLabel(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 text-white text-sm rounded px-3 py-2"
                >
                  <option value="Benign">Benign</option>
                  <option value="Malicious">Malicious</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 tracking-wider mb-2 block">CATEGORY</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 text-white text-sm rounded px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 tracking-wider mb-2 block">REVIEW STATUS</label>
                <select
                  value={editReviewStatus}
                  onChange={(e) => setEditReviewStatus(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-600 text-white text-sm rounded px-3 py-2"
                >
                  <option value={0}>No Review</option>
                  <option value={1}>Review Required</option>
                  <option value={2}>Review Completed</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditCommand} className="bg-orange-500 hover:bg-orange-600 text-white">
                  Save Changes
                </Button>
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPostModal && selectedCommand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white tracking-wider">Post to Forum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider mb-2">COMMAND</p>
                <div className="bg-neutral-800 p-2 rounded border border-neutral-700">
                  <code className="text-sm text-white font-mono break-all">{selectedCommand.command}</code>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 tracking-wider mb-2 block">DESCRIPTION</label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Describe this command and its significance..."
                  className="w-full bg-neutral-800 border border-neutral-600 text-white text-sm rounded px-3 py-2 h-24 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handlePostToForum}
                  disabled={!postDescription.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                >
                  Post to Forum
                </Button>
                <Button
                  onClick={() => {
                    setShowPostModal(false)
                    setPostDescription("")
                  }}
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCommand && !showEditModal && !showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white tracking-wider font-mono">
                  {selectedCommand.command}
                </CardTitle>
                <p className="text-sm text-neutral-400 font-mono">Username: {selectedCommand.username}</p>
                <p className="text-xs text-neutral-500 font-mono">{selectedCommand.timestamp}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedCommand(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">SECURITY LABEL</p>
                  <span
                    className={`text-sm px-3 py-1 rounded uppercase tracking-wider ${
                      selectedCommand.sec_label === "Malicious"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-green-500/20 text-green-500"
                    }`}
                  >
                    {selectedCommand.sec_label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">SOURCE IP</p>
                  <p className="text-sm text-white font-mono">{selectedCommand.source_ip}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">SOURCE PORT</p>
                  <p className="text-sm text-white font-mono">{selectedCommand.source_port}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">CATEGORY</p>
                  <p className="text-sm text-white">{selectedCommand.cat_label}</p>
                  </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">SESSION ID</p>
                  <p className="text-sm text-white font-mono break-all">{selectedCommand.session_id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">SECURITY CONFIDENCE</p>
                  <p className="text-sm text-white font-mono">{(selectedCommand.sec_conf * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">CATEGORY CONFIDENCE</p>
                  <p className="text-sm text-white font-mono">{(selectedCommand.cat_conf * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-1">REQUIRES REVIEW</p>
                  <span
                    className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${
                      selectedCommand.Requirereview === 1
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-neutral-500/20 text-neutral-300"
                    }`}
                  >
                    {selectedCommand.Requirereview === 1 ? "YES" : "NO"}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-700 pt-4">
                <p className="text-xs text-neutral-400 tracking-wider mb-2">FULL COMMAND</p>
                <div className="bg-neutral-800 p-3 rounded border border-neutral-700">
                  <code className="text-sm text-white font-mono break-all">{selectedCommand.command}</code>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button onClick={() => setShowPostModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                  Post to Forum
                </Button>
                {user?.role === "lecturer" && (
                  <>
                <Button
                  onClick={() => {
                    setEditSecLabel(selectedCommand.sec_label)
                    setEditCategory(selectedCommand.cat_label)
                    setEditReviewStatus(selectedCommand.Requirereview)
                    setShowEditModal(true)
                  }}
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleDeleteCommand}
                  variant="outline"
                  className="border-red-700 text-red-400 hover:bg-red-800 hover:text-red-300 bg-transparent"
                >
                  Delete
                </Button>
                {selectedCommand.Requirereview === 1 && (
                      <Button
                        onClick={handleMarkAsReviewed}
                        variant="outline"
                        className="border-green-700 text-green-400 hover:bg-green-800 hover:text-green-300 bg-transparent"
                      >
                        Mark as Reviewed
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
