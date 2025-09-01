export interface User {
  id: number
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
  sec_label: "Malicious" | "Benign"
  sec_conf: number
  cat_label: string
  cat_conf: number
  requirereview: number
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

// TODO: Remove this file entirely and use database.ts for all data operations
// The following mock functions should be replaced with API calls:
// - authenticateUser() -> use /api/auth/login
// - getAllUsers() -> use /api/users
// - updateUserPassword() -> use /api/users/change-password
// - addUser() -> use /api/users POST
// - getAllHoneypotCommands() -> use /api/honeypot/commands
// - searchHoneypotCommands() -> use /api/honeypot/commands with search params
// - filterHoneypotCommands() -> use /api/honeypot/commands with filter params