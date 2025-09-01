import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// ✅ adjust to your database settings
const dbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "honeypot",
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)

    // Query to get the most recent attack
    const [rows]: any = await connection.execute(
      `SELECT source_ip, timestamp, command, session_id 
       FROM honeypot_commands
       ORDER BY timestamp DESC 
       LIMIT 1`
    )

    await connection.end()

    if (rows.length === 0) {
      return NextResponse.json({ message: "No attacks found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Error fetching recent attack:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent attack" },
      { status: 500 }
    )
  }
}
