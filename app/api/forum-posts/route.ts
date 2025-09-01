import mysql from "mysql2/promise"

const dbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "Forum",
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)

    // Get recent forum posts with usernames + reply counts
    const [posts]: any = await connection.execute(`
      SELECT 
        c.postid,
        c.userid,
        u.username,              -- 👈 join users
        c.command,
        c.description,
        c.attacktype,
        c.createdat,
        COUNT(d.replyid) as reply_count
      FROM commands c
      JOIN Login.users u ON c.userid = u.ID   -- 👈 join here
      LEFT JOIN discussion d ON c.postid = d.postid
      GROUP BY c.postid, c.userid, u.username, c.command, c.description, c.attacktype, c.createdat
      ORDER BY c.createdat DESC
      LIMIT 5
    `)

    // Get recent replies (with usernames) for each post
    const postsWithReplies = await Promise.all(
      posts.map(async (post: any) => {
        const [replies]: any = await connection.execute(
          `
          SELECT d.replyid, d.userid, u.username, d.content, d.createdat
          FROM discussion d
          JOIN Login.users u ON d.userid = u.ID   -- 👈 join here
          WHERE d.postid = ?
          ORDER BY d.createdat DESC
          LIMIT 3
        `,
          [post.postid],
        )

        return {
          ...post,
          replies,
        }
      }),
    )

    await connection.end()
    return Response.json(postsWithReplies)
  } catch (error) {
    console.error("Error fetching forum data:", error)
    return Response.json([], { status: 500 })
  }
}
