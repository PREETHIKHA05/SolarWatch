"use client"

import { useEffect, useState } from "react"
import { getSession, type Session } from "@/lib/auth"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    setSession(getSession())
    const onStorage = () => setSession(getSession())
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])
  return session
}
