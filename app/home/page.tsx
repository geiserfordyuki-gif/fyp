"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface RecentAttack {
  source_ip: string
  timestamp: string
  command: string
  session_id: string
}

interface TopCommand {
  command: string
  count: number
}

interface SSHAttempt {
  username: string
  source_ip: string
  timestamp: string
  password: string
}

interface DailyAttack {
  date: string
  count: number
  displayDate?: string
}


interface ForumReply {
  replyid: number
  userid: number
  username: string
  content: string
  createdat: string
}

interface ForumPost {
  postid: number
  userid: number
  command: string
  username: string
  description: string
  attacktype: string
  createdat: string
  reply_count: number
  replies: ForumReply[]
}

export default function CommandCenterPage() {
  const [recentAttack, setRecentAttack] = useState<RecentAttack | null>(null)
  const [topCommands, setTopCommands] = useState<TopCommand[]>([])
  const [sshAttempts, setSSHAttempts] = useState<SSHAttempt[]>([])
  const [dailyAttacks, setDailyAttacks] = useState<DailyAttack[]>([])
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])

  useEffect(() => {
    // Fetch honeypot data
    const fetchData = async () => {
      try {
        const [recentRes, commandsRes, sshRes, dailyRes, forumRes] = await Promise.all([
          fetch("/api/recent-attack"),
          fetch("/api/top-commands"),
          fetch("/api/recent-ssh"),
          fetch("/api/daily-attacks"),
          fetch("/api/forum-posts"),
        ])

        if (recentRes.ok) setRecentAttack(await recentRes.json())
        if (commandsRes.ok) setTopCommands(await commandsRes.json())
        if (sshRes.ok) setSSHAttempts(await sshRes.json())
        if (dailyRes.ok) setDailyAttacks(await dailyRes.json())
        if (forumRes.ok) setForumPosts(await forumRes.json())
      } catch (error) {
        console.error("Error fetching honeypot data:", error)
      }
    }

    fetchData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent Allocation - Now showing Recent Attack */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">RECENT ATTACK ATTEMPT</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttack ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-900/20 border border-red-500/30 rounded">
                    <div className="text-lg font-bold text-red-400 font-mono">{recentAttack.source_ip}</div>
                    <div className="text-xs text-neutral-400">Source IP</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-neutral-800 rounded">
                    <div className="text-xs text-neutral-400">Timestamp</div>
                    <div className="text-sm text-white font-mono">
                      {new Date(recentAttack.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-800 rounded">
                    <div className="text-xs text-neutral-400">Command Executed</div>
                    <div className="text-sm text-orange-400 font-mono break-all">{recentAttack.command}</div>
                  </div>

                  <div className="p-3 bg-neutral-800 rounded">
                    <div className="text-xs text-neutral-400">Session ID</div>
                    <div className="text-sm text-white font-mono">{recentAttack.session_id}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-8">
                <div className="animate-pulse">Loading attack data...</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Log - Now showing SSH attempts */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">SSH ATTEMPT LOG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {sshAttempts.map((attempt, index) => (
                <div
                  key={index}
                  className="text-xs border-l-2 border-orange-500 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                >
                  <div className="text-neutral-500 font-mono">{new Date(attempt.timestamp).toLocaleString()}</div>
                  <div className="text-white">
                    User <span className="text-orange-500 font-mono">{attempt.username}</span> attempted SSH from{" "}
                    <span className="text-red-400 font-mono">{attempt.source_ip}</span>
                  </div>
                  <div className="text-neutral-400 text-xs">
                    Password: <span className="text-red-300">{attempt.password}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">RECENT FORUM POSTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {forumPosts.map((post) => (
                <div
                  key={post.postid}
                  className="border-l-2 border-orange-500 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-neutral-500 font-mono">
                      {new Date(post.createdat).toLocaleDateString()}
                    </div>
                    <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded">
                      {post.attacktype}
                    </span>
                  </div>

                  <div className="text-sm text-white font-semibold mb-1">
                    <span className="text-orange-500 font-mono">{post.command}</span>
                  </div>

                  <div className="text-xs text-neutral-300 mb-2">{post.description}</div>

                  <div className="text-xs text-neutral-500 mb-2">
                    User: {post.username} • {post.reply_count} replies
                  </div>

                  {post.replies.length > 0 && (
                    <div className="ml-2 border-l border-neutral-600 pl-2 space-y-1">
                      {post.replies.slice(0, 2).map((reply) => (
                        <div key={reply.replyid} className="text-xs">
                          <div className="text-neutral-400">
                            User: {reply.username}: <span className="text-neutral-300">{reply.content}</span>
                          </div>
                        </div>
                      ))}
                      {post.reply_count > 2 && (
                        <div className="text-xs text-orange-400">+{post.reply_count - 2} more replies...</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {forumPosts.length === 0 && (
                <div className="text-center text-neutral-500 py-8">
                  <div className="animate-pulse">Loading forum posts...</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mission Activity Chart - Now showing daily attack counts */}
        <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              DAILY ATTACK OVERVIEW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 relative">
              {dailyAttacks.length > 0 && (
                <div className="w-full h-full">
                  {(() => {
                    const chartWidth = 720
                    const chartHeight = 280
                    const maxCount = Math.max(...dailyAttacks.map((a) => a.count), 1)

                    return (
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 800 340"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMousePosition({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          })
                        }}
                      >
                        {/* Y-axis grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const y = chartHeight - (i * chartHeight) / 4
                          return (
                            <line
                              key={i}
                              x1="60"
                              y1={y}
                              x2="780"
                              y2={y}
                              stroke="#404040"
                              strokeWidth="0.5"
                              opacity="0.5"
                            />
                          )
                        })}

                        {/* Bars */}
                        <g transform="translate(60, 20)">
                          {dailyAttacks.map((attack, index) => {
                            const barWidth = (chartWidth / dailyAttacks.length) * 0.8
                            const barSpacing = chartWidth / dailyAttacks.length
                            const x = index * barSpacing + (barSpacing - barWidth) / 2
                            const barHeight = (attack.count / maxCount) * chartHeight
                            const y = chartHeight - barHeight

                            return (
                              <rect
                                key={index}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={hoveredBar === index ? "#fb923c" : "#f97316"}
                                stroke="#1f2937"
                                strokeWidth="1"
                                className="cursor-pointer transition-colors duration-200"
                                onMouseEnter={() => setHoveredBar(index)}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                            )
                          })}
                        </g>

                        {/* Y-axis labels */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const value = Math.round(maxCount * ratio)
                          const y = chartHeight - ratio * chartHeight + 20 // +20 for top margin
                          return (
                            <text
                              key={i}
                              x="50"
                              y={y + 4}
                              textAnchor="end"
                              fill="#9ca3af"
                              fontSize="12"
                              fontFamily="monospace"
                            >
                              {value}
                            </text>
                          )
                        })}

                        {/* X-axis labels */}
                        {dailyAttacks.map((attack, index) => {
                          const x =
                            60 +
                            index * (chartWidth / dailyAttacks.length) +
                            chartWidth / dailyAttacks.length / 2
                          const date = new Date(attack.date)
                          const label =
                            attack.displayDate ||
                            date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })

                          return (
                            <text
                              key={index}
                              x={x}
                              y="330"
                              textAnchor="middle"
                              fill="#9ca3af"
                              fontSize="10"
                              fontFamily="monospace"
                              transform={`rotate(-45 ${x} 330)`}
                            >
                              {label}
                            </text>
                          )
                        })}
                      </svg>
                    )
                  })()}

                  {/* Tooltip */}
                  {hoveredBar !== null && (
                    <div
                      className="absolute pointer-events-none bg-black border border-orange-500 rounded px-3 py-2 text-sm z-10"
                      style={{
                        left: mousePosition.x + 10,
                        top: mousePosition.y - 60,
                        transform: mousePosition.x > 400 ? "translateX(-100%)" : "none",
                      }}
                    >
                      <div className="text-orange-400 font-mono font-bold">
                        {new Date(dailyAttacks[hoveredBar].date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-white">
                        <span className="text-orange-500">
                          {dailyAttacks[hoveredBar].count}
                        </span>{" "}
                        attacks
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chart title */}
              <div className="absolute top-2 right-2 text-xs text-neutral-500 font-mono">
                Last 14 Days • Total:{" "}
                {dailyAttacks.reduce((sum, attack) => sum + attack.count, 0)} attacks
              </div>
            </div>
          </CardContent>
        </Card>
                 
        {/* Mission Information - Now showing top commands */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">TOP EXECUTED COMMANDS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-500 font-medium">Most Frequent Commands</span>
              </div>

              <div className="space-y-3">
                {topCommands.slice(0, 5).map((cmd, index) => (
                  <div key={index} className="p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-neutral-400">#{index + 1}</span>
                      <span className="text-2xl text-white font-mono font-bold">{cmd.count}</span>
                    </div>
                    <div className="text-sm text-orange-400 font-mono break-all">{cmd.command}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>                                                                                                                                                                                                                           
      </div>
    </div>
  )
}
