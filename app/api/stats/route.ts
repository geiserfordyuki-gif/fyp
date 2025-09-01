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

    const [totalAttacksRows] = await connection.execute(`
      SELECT COUNT(*) AS total_attacks FROM honeypot_credentials
    `)
    const totalAttacks = (totalAttacksRows as any)[0].total_attacks

    const [latestAttackRows] = await connection.execute(`
      SELECT MAX(timestamp) AS latest_attack FROM honeypot_credentials
    `)
    const latestAttack = (latestAttackRows as any)[0].latest_attack

    const [uniqueIPRows] = await connection.execute(`
      SELECT COUNT(DISTINCT source_ip) AS unique_ips FROM honeypot_credentials
    `)
    const uniqueIPs = (uniqueIPRows as any)[0].unique_ips

    const [uniqueUserRows] = await connection.execute(`
      SELECT COUNT(DISTINCT username) AS unique_users FROM honeypot_credentials
    `)
    const uniqueUsers = (uniqueUserRows as any)[0].unique_users

    await connection.end()

    const stats = {
      totalAttacks,
      latestAttack,
      uniqueIPs,
      uniqueUsers,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[DB ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
