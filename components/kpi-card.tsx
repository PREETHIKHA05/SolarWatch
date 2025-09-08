import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <Card
      className="m-2 border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
      style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-zinc-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-zinc-100">{value}</div>
        {subtitle ? <div className="mt-1 text-xs text-zinc-500">{subtitle}</div> : null}
      </CardContent>
    </Card>
  )
}
