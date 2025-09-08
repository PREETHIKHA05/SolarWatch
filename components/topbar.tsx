"use client"

import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"

export function Topbar({ username, cityLabel }: { username: string; cityLabel: string }) {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-teal-500" aria-hidden />
          <h1 className="text-pretty text-sm font-medium text-zinc-200 md:text-base">Solar Watch</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
            onClick={() => {
              signOut()
              router.replace("/login")
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
