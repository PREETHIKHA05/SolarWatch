"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, getAllowedExampleUsers } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldCheck, TriangleAlert } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const examples = getAllowedExampleUsers()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = signIn(username.trim(), password.trim())
    if (!res.ok) {
      setError(res.error || "Login failed")
      return
    }
    router.replace("/dashboard")
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <Card
        className="border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
        style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
      >
        <CardHeader>
          <CardTitle className="text-balance text-lg text-zinc-100">Sign in</CardTitle>
          <CardDescription className="text-zinc-400">
            Use one your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-3 border-red-900 bg-red-950 text-red-200">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-zinc-300">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400 focus:border-gray-400 focus:shadow-[0_0_8px_2px_rgba(200,200,200,0.7)] transition"
                style={{ boxShadow: "0 0 8px 2px #aaa" }}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400 focus:border-gray-400 focus:shadow-[0_0_8px_2px_rgba(200,200,200,0.7)] transition"
                style={{ boxShadow: "0 0 8px 2px #aaa" }}
                autoComplete="current-password"
              />
            </div>
            <Button className="bg-teal-600 text-black hover:bg-teal-500">Sign in</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <a
          href="/register"
          className="text-teal-400 hover:text-teal-300 underline text-sm"
        >
          Register a new admin user
        </a>
      </div>
    </div>
  )
}
