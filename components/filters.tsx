"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type FilterState = {
  query: string
  status: "all" | "ok" | "warn" | "critical"
  sort: "name" | "eff" | "actual"
}

export function Filters({ onChange }: { onChange: (state: FilterState) => void }) {
  const [state, setState] = useState<FilterState>({ query: "", status: "all", sort: "name" })
  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    const next = { ...state, [key]: value }
    setState(next)
    onChange(next)
  }
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Input
        placeholder="Search building..."
        className="border-2 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-teal-400 focus:border-teal-400 focus:shadow-[0_0_8px_2px_rgba(0,255,255,0.7)] transition"
        style={{ boxShadow: "0 0 8px 2px #0ff" }}
        value={state.query}
        onChange={(e) => update("query", e.target.value)}
      />
      <Select value={state.status} onValueChange={(v: any) => update("status", v)}>
        <SelectTrigger className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="ok">OK</SelectItem>
          <SelectItem value="warn">Warning</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>
      <Select value={state.sort} onValueChange={(v: any) => update("sort", v)}>
        <SelectTrigger className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="eff">Efficiency</SelectItem>
          <SelectItem value="actual">Actual Output</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
