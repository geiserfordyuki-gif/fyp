import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "honeypot",
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)

    // Query top 5 most executed commands
    const [rows]: any = await connection.execute(
      `SELECT command, COUNT(*) as count
       FROM honeypot_commands 
       GROUP BY command 
       ORDER BY count DESC 
       LIMIT 5`
    )

    await connection.end()

    if (rows.length === 0) {
      return NextResponse.json({ message: "No command data found" }, { status: 404 })
    }

    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching top commands:", error)
    return NextResponse.json(
      { error: "Failed to fetch top commands" },
      { status: 500 }
    )
  }
}
