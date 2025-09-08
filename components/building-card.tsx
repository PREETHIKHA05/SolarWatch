import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type Props = {
  id: string
  name: string
  cityLabel: string
  expectedKw: number
  actualKw: number
  efficiency: number // 0..1
  status: "ok" | "warn" | "critical"
}

function StatusBadge({ status }: { status: Props["status"] }) {
  if (status === "ok") return <Badge className="bg-teal-600 text-white hover:bg-teal-600/90">OK</Badge>
  if (status === "warn") return <Badge className="bg-amber-500 text-black hover:bg-amber-500/90">Warning</Badge>
  return <Badge className="bg-red-600 text-white hover:bg-red-600/90">Critical</Badge>
}

export function BuildingCard({ id, name, cityLabel, expectedKw, actualKw, efficiency, status }: Props) {
  return (
    <Card
      className="group m-2 border-2 border-zinc-800 bg-zinc-950 transition shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)]"
      style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-balance text-base font-semibold text-zinc-100">{name}</CardTitle>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="text-xs text-zinc-400">{cityLabel}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold text-zinc-100">{actualKw} kW</div>
          <div className="text-xs text-zinc-500">/ expected {expectedKw} kW</div>
        </div>
        <div className="mt-1">
          <Progress value={Math.round(efficiency * 100)} className="h-2 bg-zinc-900" />
          <div className="mt-1 text-xs text-zinc-400">Efficiency {Math.round(efficiency * 100)}%</div>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/buildings/${id}`}
          className="text-sm font-medium text-teal-400 hover:text-teal-300"
          aria-label={`View details for ${name}`}
        >
          View details →
        </Link>
      </CardFooter>
    </Card>
  )
}
