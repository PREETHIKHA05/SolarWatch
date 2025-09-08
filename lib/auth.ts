// Simple client-side session for 5 fixed credentials (one per city)
export type CityKey = "nyc" | "la" | "sf" | "chi" | "dal"

export type Session = {
  city: CityKey
  username: string
  createdAt: number
}

const SESSION_KEY = "solar_session_v1"

const allowedUsers: Record<string, { password: string; city: CityKey; label: string }> = {
  "nyc-admin": { password: "nyc-2025", city: "nyc", label: "New York City" },
  "la-admin": { password: "la-2025", city: "la", label: "Los Angeles" },
  "sf-admin": { password: "sf-2025", city: "sf", label: "San Francisco" },
  "chi-admin": { password: "chi-2025", city: "chi", label: "Chicago" },
  "dal-admin": { password: "dal-2025", city: "dal", label: "Dallas" },
}

export function getCityLabel(city: CityKey) {
  switch (city) {
    case "nyc":
      return "New York City"
    case "la":
      return "Los Angeles"
    case "sf":
      return "San Francisco"
    case "chi":
      return "Chicago"
    case "dal":
      return "Dallas"
  }
}

export function signIn(username: string, password: string): { ok: boolean; error?: string; session?: Session } {
  const u = allowedUsers[username]
  if (!u) return { ok: false, error: "Invalid credentials" }
  if (u.password !== password) return { ok: false, error: "Invalid credentials" }
  const session: Session = { city: u.city, username, createdAt: Date.now() }
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  return { ok: true, session }
}

export function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function getAllowedExampleUsers() {
  return Object.entries(allowedUsers).map(([username, { password, city, label }]) => ({
    username,
    password,
    city,
    label,
  }))
}
