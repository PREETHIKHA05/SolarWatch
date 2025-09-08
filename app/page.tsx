"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { useSession } from "@/hooks/use-session"
import { getCityLabel } from "@/lib/auth"
import { fetchBuildings } from "@/services/api"
import { Topbar } from "@/components/topbar"
import { KpiCard } from "@/components/kpi-card"
import { BuildingCard } from "@/components/building-card"
import { Filters, type FilterState } from "@/components/filters"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

const fetcher = async () => fetchBuildings()

export default function DashboardPage() {
  const session = useSession()
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({ query: "", status: "all", sort: "name" })

  const { data: buildings, isLoading } = useSWR("buildings", fetcher, { refreshInterval: 10000 })

  const cityLabel = session ? getCityLabel(session.city) : ""

  const filtered = useMemo(() => {
    if (!buildings) return []
    let arr = buildings.slice()
    if (filters.query) {
      const q = filters.query.toLowerCase()
      arr = arr.filter((b: any) => b.name.toLowerCase().includes(q))
    }
    if (filters.status !== "all") {
      arr = arr.filter((b: any) => b.status === filters.status)
    }
    if (filters.sort === "name") arr.sort((a: any, b: any) => a.name.localeCompare(b.name))
    if (filters.sort === "eff") arr.sort((a: any, b: any) => b.efficiency - a.efficiency)
    if (filters.sort === "actual") arr.sort((a: any, b: any) => b.actualKw - a.actualKw)
    return arr
  }, [buildings, filters])

  const totals = useMemo(() => {
    if (!buildings || buildings.length === 0) return null
    const totalActual = buildings.reduce((s: number, b: any) => s + b.actualKw, 0)
    const totalExpected = buildings.reduce((s: number, b: any) => s + b.expectedKw, 0)
    const avgEff = buildings.reduce((s: number, b: any) => s + b.efficiency, 0) / buildings.length
    return {
      totalActual,
      totalExpected,
      avgEff,
    }
  }, [buildings])

  const criticals = (buildings || []).filter((b: any) => b.status === "critical")

  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => router.replace("/login"), 300)
      return () => clearTimeout(timer)
    }
  }, [session, router])

  if (!session) return null

  return (
    <main className="min-h-screen bg-black">
      <Topbar username={session.username} cityLabel={cityLabel} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-pretty text-xl font-semibold text-zinc-100">Overview</h2>
          <p className="text-sm text-zinc-400">Real-time performance across all buildings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Total Output (kW)"
            value={totals ? `${totals.totalActual}` : isLoading ? "…" : "0"}
            subtitle={totals ? `Expected ${totals.totalExpected} kW` : undefined}
          />
          <KpiCard
            title="Average Efficiency"
            value={totals ? `${Math.round((totals.avgEff || 0) * 100)}%` : isLoading ? "…" : "0%"}
            subtitle="Target ≥ 90%"
          />
          <KpiCard title="Underperforming" value={`${criticals.length}`} subtitle="Critical status" />
        </div>

        {criticals.length > 0 ? (
          <div className="mt-4">
            <Alert className="border-amber-800 bg-amber-950 text-amber-100">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Attention required</AlertTitle>
              <AlertDescription>
                {criticals.length} building{criticals.length > 1 ? "s are" : " is"} performing below acceptable
                efficiency. Click a card for details.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="mt-8">
          <Filters onChange={setFilters} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoading && filtered.length === 0 ? (
            <div className="col-span-full text-sm text-zinc-500">Loading buildings…</div>
          ) : null}
          {filtered.slice(0, 5).map((b: any) => (
            <BuildingCard
              key={b.id}
              id={b.id}
              name={b.name}
              cityLabel={getCityLabel(b.city)}
              expectedKw={b.expectedKw}
              actualKw={b.actualKw}
              efficiency={b.efficiency}
              status={b.status}
            />
          ))}
        </section>

        <section className="mt-10">
          <h3 className="text-pretty text-lg font-semibold text-zinc-100">Locations</h3>
          <div className="mt-3 rounded border border-zinc-800 bg-zinc-950 p-4">
            <div className="grid gap-2 text-sm text-zinc-400 md:grid-cols-5">
              {(buildings || []).map((b: any) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-3 py-2"
                >
                  <span className="text-zinc-300">{b.name}</span>
                  <span className="text-xs text-zinc-500">
                    {getCityLabel(b.city)} • {new Date(b.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-zinc-500">
              Map placeholder — replace with your preferred map component later.
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
