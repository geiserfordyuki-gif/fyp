"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import TagCloudSection from "../../components/tag-cloud";
import { getStatValue, Stats } from "../../components/stats"
import { useEffect, useState } from "react"

export default function TrafficPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/stats") // <-- fetch stats
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">TRAFFIC CENTER</h1>
          <p className="text-sm text-neutral-400">SSH Connection Attempt</p>
        </div>

      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL ATTACKS</p>
                <p className="text-2xl font-bold text-white font-mono">{stats?.totalAttacks ?? 0}</p>
              </div>
              <Target className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>


        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">LATEST ATTACK</p>
                <p className="text-2xl font-bold text-white font-mono">  {stats ? getStatValue(stats, "latestAttack") : "-"}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">UNIQUE IPs</p>
                <p className="text-2xl font-bold text-white font-mono">{stats?.uniqueIPs ?? 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">UNIQUE USERS</p>
                <p className="text-2xl font-bold text-white font-mono">{stats?.uniqueUsers ?? 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

        <TagCloudSection 
          title="Top 10 Username Tagcloud" 
          maxTags={10} 
          minSize={12} 
          maxSize={28} 
          category="user"     // ✅ only usernames
        />

      {/* Additional tag clouds for different categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TagCloudSection 
            title="Top 10 Password Tagcloud" 
            maxTags={10} 
            minSize={12} 
            maxSize={28} 
            category="password" // ✅ only passwords
          />
          <TagCloudSection 
            title="Top 10 Attack IP Source" 
            maxTags={10} 
            minSize={12} 
            maxSize={28} 
            category="ip"       // ✅ only IPs
          />
      </div>
    </div>
  )
}
