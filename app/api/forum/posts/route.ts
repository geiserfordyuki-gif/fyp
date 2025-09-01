import { type NextRequest, NextResponse } from "next/server"
import { createForumPost, getForumPosts } from "../../../../lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userid, command, description, attacktype } = await request.json()

    const postId = await createForumPost(userid, command, description, attacktype)

    if (postId) {
      return NextResponse.json({ message: "Post created successfully", postId })
    } else {
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }
  } catch (error) {
    console.error("Create forum post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const posts = await getForumPosts()
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get forum posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
