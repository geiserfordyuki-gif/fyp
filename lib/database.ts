import mysql from "mysql2/promise"

// Database configurations
const honeypotDbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "honeypot",
}

const loginDbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "Login",
}

const forumDbConfig = {
  host: "localhost",
  user: "honeypotuser",
  password: "StrongPass123",
  database: "Forum",
}


// Create connection pools for better performance
const honeypotPool = mysql.createPool(honeypotDbConfig)
const loginPool = mysql.createPool(loginDbConfig)
const forumPool = mysql.createPool(forumDbConfig)

// Types for database records
export interface User {
  ID: number
  username: string
  password: string
  role: "student" | "lecturer"
}

export interface HoneypotCommand {
  id: number
  timestamp: string
  session_id: string
  source_ip: string
  command: string
  sec_label: string
  sec_conf: number
  cat_label: string
  cat_conf: number
  Requirereview: number
}

export interface HoneypotCredential {
  session_id: string
  timestamp: string
  source_ip: string
  source_port: number
  dest_ip: string
  dest_port: number
  username: string
  password: string
}

export interface ForumCommand {
  postid: number
  userid: number
  command: string
  description: string
  attacktype: string
  createdat: string
}

export interface ForumDiscussion {
  replyid: number
  postid: number
  userid: number
  content: string
  createdat: string
}

// Authentication functions
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const [rows] = await loginPool.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    )
    console.log("Auth query result:", rows)   // 👈 add this
    const users = rows as User[]
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
export async function getAllUsers(): Promise<User[]> {
  try {
    const [rows] = await loginPool.execute("SELECT * FROM users ORDER BY ID")
    return rows as User[]
  } catch (error) {
    console.error("Get users error:", error)
    return []
  }
}

export async function addUser(username: string, password: string, role: "student" | "lecturer"): Promise<boolean> {
  try {
    await loginPool.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role])
    return true
  } catch (error) {
    console.error("Add user error:", error)
    return false
  }
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  try {
    await loginPool.execute("UPDATE users SET password = ? WHERE ID = ?", [newPassword, userId])
    return true
  } catch (error) {
    console.error("Update password error:", error)
    return false
  }
}


export async function deleteUser(userId: number): Promise<boolean> {
  try {
    const [result] = await loginPool.execute("DELETE FROM users WHERE ID = ?", [userId])
    const deleteResult = result as any
    return deleteResult.affectedRows > 0
  } catch (error) {
    console.error("Delete user error:", error)
    return false
  }
}

// Honeypot data functions
export async function getHoneypotCommands(
  search?: string,
  secLabel?: string,
  catLabel?: string,
  sourceIp?: string,
): Promise<HoneypotCommand[]> {
  try {
    let query = `
      SELECT 
        c.ID,
        c.timestamp,
        c.session_id,
        cred.source_ip,
        cred.source_port,
        cred.username,
        c.command,
        c.sec_label,
        c.sec_conf,
        c.cat_label,
        c.cat_conf,
        c.Requirereview
      FROM honeypot_commands c
      LEFT JOIN honeypot_credentials cred 
        ON c.session_id = cred.session_id
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      query += " AND (c.command LIKE ? OR cred.source_ip LIKE ? OR c.session_id LIKE ? OR cred.username LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (secLabel) {
      query += " AND c.sec_label = ?"
      params.push(secLabel)
    }

    if (catLabel) {
      query += " AND c.cat_label = ?"
      params.push(catLabel)
    }

    if (sourceIp) {
      query += " AND cred.source_ip = ?"
      params.push(sourceIp)
    }

    query += " ORDER BY c.timestamp DESC"

    const [rows] = await honeypotPool.execute(query, params)

    return (rows as any[]).map((row) => ({
      id: row.ID,
      timestamp: row.timestamp,
      session_id: row.session_id,
      source_ip: row.source_ip,
      source_port: row.source_port,  
      username: row.username,  
      command: row.command,
      sec_label: row.sec_label,
      sec_conf: row.sec_conf,
      cat_label: row.cat_label,
      cat_conf: row.cat_conf,
      Requirereview: row.Requirereview,
    }))
  } catch (error) {
    console.error("Get honeypot commands error:", error)
    return []
  }
}

export async function getHoneypotCredentials(sessionId: string): Promise<HoneypotCredential[]> {
  try {
    const [rows] = await honeypotPool.execute(
      "SELECT * FROM honeypot_credentials WHERE session_id = ? ORDER BY timestamp DESC",
      [sessionId],
    )
    return rows as HoneypotCredential[]
  } catch (error) {
    console.error("Get honeypot credentials error:", error)
    return []
  }
}

export async function getUniqueSecLabels(): Promise<string[]> {
  try {
    const [rows] = await honeypotPool.execute(
      "SELECT DISTINCT sec_label FROM honeypot_commands WHERE sec_label IS NOT NULL ORDER BY sec_label",
    )
    return (rows as any[]).map((row) => row.sec_label)
  } catch (error) {
    console.error("Get sec labels error:", error)
    return []
  }
}

export async function getUniqueCatLabels(): Promise<string[]> {
  try {
    const [rows] = await honeypotPool.execute(
      "SELECT DISTINCT cat_label FROM honeypot_commands WHERE cat_label IS NOT NULL ORDER BY cat_label",
    )
    return (rows as any[]).map((row) => row.cat_label)
  } catch (error) {
    console.error("Get cat labels error:", error)
    return []
  }
}

export async function getUniqueSourceIPs(): Promise<string[]> {
  try {
    const [rows] = await honeypotPool.execute(
      "SELECT DISTINCT source_ip FROM honeypot_commands WHERE source_ip IS NOT NULL ORDER BY source_ip",
    )
    return (rows as any[]).map((row) => row.source_ip)
  } catch (error) {
    console.error("Get source IPs error:", error)
    return []
  }
}


export async function updateHoneypotCommand(
  commandId: number,
  sec_label: string,
  cat_label: string,
  Requirereview: number,
): Promise<boolean> {
  try {
    await honeypotPool.execute(
      "UPDATE honeypot_commands SET sec_label = ?, cat_label = ?, Requirereview = ? WHERE ID = ?",
      [sec_label, cat_label, Requirereview, commandId],
    )
    return true
  } catch (error) {
    console.error("Update honeypot command error:", error)
    return false
  }
}

export async function deleteHoneypotCommand(commandId: number): Promise<boolean> {
  try {
    const [result] = await honeypotPool.execute("DELETE FROM honeypot_commands WHERE ID = ?", [commandId])
    const deleteResult = result as any
    return deleteResult.affectedRows > 0
  } catch (error) {
    console.error("Delete honeypot command error:", error)
    return false
  }
}

// Forum database functions
export async function createForumPost(
  userid: number,
  command: string,
  description: string,
  attacktype: string,
): Promise<number | null> {
  try {
    const [result] = await forumPool.execute(
      "INSERT INTO commands (userid, command, description, attacktype, createdat) VALUES (?, ?, ?, ?, NOW())",
      [userid, command, description, attacktype],
    )
    const insertResult = result as any
    return insertResult.insertId
  } catch (error) {
    console.error("Create forum post error:", error)
    return null
  }
}

export async function getForumPosts(): Promise<ForumCommand[]> {
  try {
    const [rows] = await forumPool.execute(`
      SELECT c.*, u.username 
      FROM commands c 
      JOIN Login.users u ON c.userid = u.ID 
      ORDER BY c.createdat DESC
    `)
    return rows as ForumCommand[]
  } catch (error) {
    console.error("Get forum posts error:", error)
    return []
  }
}
export async function addForumReply(
  postid: number,
  userid: number,
  content: string
): Promise<boolean> {
  try {
    if (postid === undefined || userid === undefined || content === undefined) {
      throw new Error("postid, userid, and content must not be undefined");
    }

    const [result] = await forumPool.execute(
      "INSERT INTO discussion (postid, userid, content, createdat) VALUES (?, ?, ?, NOW())",
      [postid, userid, content]
    );

    const insertResult = result as any;
    return insertResult.affectedRows > 0;
  } catch (error) {
    console.error("Add forum reply error:", error);
    return false;
  }
}


export async function getForumReplies(postid: number): Promise<ForumDiscussion[]> {
  try {
    const [rows] = await forumPool.execute(
      `
      SELECT d.*, u.username 
      FROM discussion d 
      JOIN Login.users u ON d.userid = u.ID 
      WHERE d.postid = ? 
      ORDER BY d.createdat ASC
    `,
      [postid],
    )
    return rows as ForumDiscussion[]
  } catch (error) {
    console.error("Get forum replies error:", error)
    return []
  }
}


// Delete forum post function
export async function deleteForumPost(postid: number): Promise<boolean> {
  try {
    // Delete replies first (foreign key constraint)
    await forumPool.execute("DELETE FROM discussion WHERE postid = ?", [postid])

    // Then delete the post
    const [result] = await forumPool.execute("DELETE FROM commands WHERE postid = ?", [postid])
    const deleteResult = result as any
    return deleteResult.affectedRows > 0
  } catch (error) {
    console.error("Delete forum post error:", error)
    return false
  }
}


// Delete forum reply function
export async function deleteForumReply(replyid: number): Promise<boolean> {
  try {
    const [result] = await forumPool.execute("DELETE FROM discussion WHERE replyid = ?", [replyid])
    const deleteResult = result as any
    return deleteResult.affectedRows > 0
  } catch (error) {
    console.error("Delete forum reply error:", error)
    return false
  }
}