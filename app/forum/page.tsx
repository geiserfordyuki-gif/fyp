"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Clock, User, Command } from "lucide-react"
import { useAuth } from "../../lib/auth-context"

interface ForumPost {
  postid: number
  userid: number
  command: string
  description: string
  attacktype: string
  createdat: string
  username?: string
}

interface Reply {
  replyid: number
  postid: number
  userid: number
  content: string
  createdat: string
  username?: string
}

export default function ForumPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showReplies, setShowReplies] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/forum/posts")
      const data = await response.json()
      if (response.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReplies = async (postId: number) => {
    try {
      const response = await fetch(`/api/forum/replies?postid=${postId}`)
      const data = await response.json()
      if (response.ok) {
        setReplies(data.replies)
      }
    } catch (error) {
      console.error("Error fetching replies:", error)
    }
  }

  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post)
    setShowReplies(true)
    fetchReplies(post.postid)
  }

  const handleAddReply = async () => {
    if (!selectedPost || !newReply.trim()) return

    try {
      const response = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postid: selectedPost.postid,
          userid: user?.ID,
          content: newReply,
        }),
      })

      if (response.ok) {
        setNewReply("")
        fetchReplies(selectedPost.postid)
      }
    } catch (error) {
      console.error("Error adding reply:", error)
    }
  }


  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh posts list
        fetchPosts()
        // Close modal if the deleted post was selected
        if (selectedPost?.postid === postId) {
          setShowReplies(false)
          setSelectedPost(null)
          setReplies([])
        }
      } else {
        alert("Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Error deleting post")
    }
  }


  const handleDeleteReply = async (replyId: number) => {
    if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh replies list
        if (selectedPost) {
          fetchReplies(selectedPost.postid)
        }
      } else {
        alert("Failed to delete reply")
      }
    } catch (error) {
      console.error("Error deleting reply:", error)
      alert("Error deleting reply")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-cyan-400">Loading forum posts...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">FORUM</h1>
          <p className="text-sm text-neutral-400">Community discussions on security commands</p>
        </div>
      </div>

      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            RECENT POSTS ({posts.length} posts)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.postid}
                onClick={() => handlePostClick(post)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-750 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Command className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-500 font-medium uppercase tracking-wider">
                      {post.attacktype}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdat).toLocaleString()}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="bg-neutral-900 p-2 rounded border border-neutral-600 mb-2">
                    <code className="text-sm text-cyan-400 font-mono break-all">{post.command}</code>
                  </div>
                  <p className="text-sm text-neutral-300">{post.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-neutral-400" />
                    <span className="text-xs text-neutral-400">Posted by User {post.userid}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-neutral-600 text-neutral-400 hover:bg-neutral-700 bg-transparent text-xs"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    View Discussion
                  </Button>
                    {user && user.ID === post.userid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePost(post.postid)
                        }}
                        className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent text-xs"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Replies Modal */}
      {showReplies && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white tracking-wider">
                  {selectedPost.attacktype} Discussion
                </CardTitle>
                <div className="bg-neutral-800 p-2 rounded border border-neutral-600 mt-2">
                  <code className="text-sm text-cyan-400 font-mono break-all">{selectedPost.command}</code>
                </div>
                <p className="text-sm text-neutral-300 mt-2">{selectedPost.description}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowReplies(false)
                  setSelectedPost(null)
                  setReplies([])
                }}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t border-neutral-700 pt-4">
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-4">REPLIES ({replies.length})</h3>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {replies.map((reply) => (
                    <div key={reply.replyid} className="bg-neutral-800 border border-neutral-700 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-neutral-400" />
                          <span className="text-xs text-neutral-400">User {reply.userid}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <Clock className="w-3 h-3" />
                            {new Date(reply.createdat).toLocaleString()}
                                                      </div>
                            {user && user.ID === reply.userid && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteReply(reply.replyid)}
                                className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent text-xs ml-2">
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-300">{reply.content}</p>
                      </div>
                    ))}
                  </div>

                <div className="border-t border-neutral-700 pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add your reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400"
                      onKeyPress={(e) => e.key === "Enter" && handleAddReply()}
                    />
                    <Button
                      onClick={handleAddReply}
                      disabled={!newReply.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
