import { NextResponse } from "next/server"

import mysql from "mysql2/promise"

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "honeypotuser",
      password: "StrongPass123",
      database: "honeypot",
    })

    // Example query: usernames
    const [userRows] = await connection.execute(`
      SELECT username AS name, COUNT(*) AS count, 'user' AS category
      FROM honeypot_credentials
      GROUP BY username
      ORDER BY count DESC
      LIMIT 50
    `)

    // Example query: passwords
    const [passRows] = await connection.execute(`
      SELECT password AS name, COUNT(*) AS count, 'password' AS category
      FROM honeypot_credentials
      GROUP BY password
      ORDER BY count DESC
      LIMIT 50
    `)

    // Example query: source IPs
    const [ipRows] = await connection.execute(`
      SELECT source_ip AS name, COUNT(*) AS count, 'ip' AS category
      FROM honeypot_credentials
      GROUP BY source_ip
      ORDER BY count DESC
      LIMIT 50
    `)
    
    await connection.end()
    // return NextResponse.json(rows)

    const tags = [
      ...(userRows as any[]).map((row, i) => ({ id: i + 1, ...row })),
      ...(passRows as any[]).map((row, i) => ({ id: 100 + i + 1, ...row })),
      ...(ipRows as any[]).map((row, i) => ({ id: 200 + i + 1, ...row })),
    ]

    return NextResponse.json(tags)
  } catch (error) {
    console.error("[DB ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}
