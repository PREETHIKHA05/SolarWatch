"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "@/hooks/use-session"
import useSWR from "swr"
import { fetchBuilding, fetchBuildingSeries } from "@/services/api"
import { Topbar } from "@/components/topbar"
import { getCityLabel } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PowerChart } from "@/components/charts/power-chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const buildFetcher = (id: string) => () => fetchBuilding(id)
const seriesFetcher = (id: string) => () => fetchBuildingSeries(id)

export default function BuildingDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const session = useSession()

  const { data: building, isLoading } = useSWR(["building", params.id], buildFetcher(params.id), {
    refreshInterval: 10000,
  })
  const { data: series } = useSWR(["series", params.id], seriesFetcher(params.id), {
    refreshInterval: 10000,
  })

  useEffect(() => {
    if (!session) {
      const t = setTimeout(() => router.replace("/login"), 300)
      return () => clearTimeout(t)
    }
  }, [session, router])

  if (!session) return null

  return (
    <main className="min-h-screen bg-black">
      <Topbar username={session.username} cityLabel={getCityLabel(session.city)} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-pretty text-xl font-semibold text-zinc-100">
              {isLoading || !building ? "Loading…" : building.name}
            </h2>
            {building ? (
              <div className="mt-1 text-sm text-zinc-400">
                {getCityLabel(building.city)} • Last updated {new Date(building.lastUpdated).toLocaleTimeString()}
              </div>
            ) : null}
          </div>
          <Button asChild variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900">
            <Link href="/dashboard">← Back to dashboard</Link>
          </Button>
        </div>

        {building ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="m-2 border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
              style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Current Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-zinc-100">{building.actualKw} kW</div>
                <div className="mt-1 text-xs text-zinc-500">Expected {building.expectedKw} kW</div>
              </CardContent>
            </Card>
            <Card
              className="m-2 border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
              style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-3xl font-semibold text-zinc-100">{Math.round(building.efficiency * 100)}%</div>
                <div>
                  {building.status === "ok" && <Badge className="bg-teal-600 text-white">OK</Badge>}
                  {building.status === "warn" && <Badge className="bg-amber-500 text-black">Warning</Badge>}
                  {building.status === "critical" && <Badge className="bg-red-600 text-white">Critical</Badge>}
                </div>
              </CardContent>
            </Card>
            <Card
              className="m-2 border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
              style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400">Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-zinc-100">{building.capacityKw} kW</div>
                <div className="mt-1 text-xs text-zinc-500">Nameplate capacity</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card
          className="mt-6 m-2 border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
          style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
        >
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">24h Power Output</CardTitle>
          </CardHeader>
          <CardContent>
            {series ? <PowerChart data={series} /> : <div className="text-sm text-zinc-500">Loading chart…</div>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
