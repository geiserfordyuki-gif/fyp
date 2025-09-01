"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Tag } from "lucide-react"

interface TagData {
  id: number
  name: string
  count: number
  category?: string
}

interface TagCloudProps {
  title?: string
  maxTags?: number
  minSize?: number
  maxSize?: number
  category?: string   
}

export default function TagCloudSection({ 
  title = "DATA TAGS", 
  maxTags = 50, 
  minSize = 12, 
  maxSize = 32,
  category
}: TagCloudProps) {
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tags")
      const data: TagData[] = await response.json()

      // ✅ filter by category if provided
      const filtered = category ? data.filter(tag => tag.category === category) : data
      setTags(filtered.slice(0, maxTags))
    } catch (err) {
      console.error("Failed to fetch tags", err)
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const getTagSize = (count: number) => {
    if (tags.length === 0) return minSize
    const maxCount = Math.max(...tags.map(t => t.count))
    const minCount = Math.min(...tags.map(t => t.count))
    const range = maxCount - minCount || 1
    return Math.round(((count - minCount) / range) * (maxSize - minSize) + minSize)
  }

  if (loading) {
    return (
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white tracking-wider flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading tags...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white tracking-wider flex items-center gap-2">
          <Tag className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-center min-h-[200px]">
          {tags.map(tag => (
            <span
              key={tag.id}
              style={{ fontSize: `${getTagSize(tag.count)}px` }}
              className="px-3 py-1 rounded-md border border-neutral-700 text-white font-mono"
            >
              {tag.name}
              <span className="ml-1 text-xs opacity-70">{tag.count}</span>
            </span>
          ))}
        </div>
        {tags.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            No tags found in database
          </div>
        )}
      </CardContent>
    </Card>
  )
}
