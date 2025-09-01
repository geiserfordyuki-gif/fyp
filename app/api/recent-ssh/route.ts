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

    // Query last 10 SSH login attempts
    const [rows]: any = await connection.execute(
      `SELECT username, source_ip, timestamp, password
       FROM honeypot_credentials
       ORDER BY timestamp DESC
       LIMIT 10`
    )

    await connection.end()

    if (rows.length === 0) {
      return NextResponse.json({ message: "No SSH attempts found" }, { status: 404 })
    }

    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching recent SSH attempts:", error)
    return NextResponse.json(
      { error: "Failed to fetch SSH attempts" },
      { status: 500 }
    )
  }
}
