// components/stats.tsx

// Interface for stats object
export interface Stats {
  totalAttacks: number
  latestAttack: string
  uniqueIPs: number
  uniqueUsers: number
}


export const getStatValue = (stats: Stats, key: keyof Stats): number | string => {
  const value = stats[key]

  if (!value) return key === "latestAttack" ? "-" : 0

  // Format latestAttack nicely
  if (key === "latestAttack") {
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  return value
}