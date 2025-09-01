import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "honeypot",
}

interface DailyAttack {
  date: string
  count: number
  displayDate?: string
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(`
      SELECT DATE(timestamp) AS date, COUNT(*) AS count
      FROM honeypot_commands
      WHERE DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date ASC;
    `)
    // Cast rows to DailyAttack[]
    const dailyRows = rows as DailyAttack[]
        
    // Fill in missing dates with 0 counts
    const result: DailyAttack[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 13)
    
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      const dateStr = currentDate.toISOString().split('T')[0]

      const found = dailyRows.find(row => {
        const rowDateStr = new Date(row.date).toISOString().split('T')[0]
        return rowDateStr === dateStr
      })

      result.push({
        date: dateStr,
        count: found ? found.count : 0,
        displayDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }
    await connection.end()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching daily attacks:", error)
    return NextResponse.json(
      { error: "Failed to fetch daily attacks" },
      { status: 500 }
    )
  }
}