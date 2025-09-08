"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type Point = { t: string; expected: number; actual: number }

export function PowerChart({ data }: { data: Point[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => new Date(v).getHours().toString().padStart(2, "0")}
            stroke="#a1a1aa"
            tick={{ fontSize: 10 }}
          />
          <YAxis stroke="#a1a1aa" tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#09090b", border: "1px solid #27272a", color: "#e4e4e7" }}
            labelFormatter={(v) => new Date(v).toLocaleString()}
          />
          <Area type="monotone" dataKey="expected" stroke="#a1a1aa" fillOpacity={0} name="Expected (kW)" />
          <Area type="monotone" dataKey="actual" stroke="#14b8a6" fill="url(#actualFill)" name="Actual (kW)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
