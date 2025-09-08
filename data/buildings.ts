// Mock data and utilities for 5 buildings across 5 cities
// Primary teal: #14b8a6; Accents: amber #f59e0b, red #ef4444; Neutrals handled by theme

export type Building = {
  id: string
  name: string
  city: "Chennai" | "Thiruvallur" | "Kancheepuram" | "Chengalpet" | "Trichy"
  capacityKw: number
  expectedKw: number
  actualKw: number
  efficiency: number // 0..1
  status: "ok" | "warn" | "critical"
  lastUpdated: string
  coords: { lat: number; lng: number }
}

export type TimeseriesPoint = { t: string; expected: number; actual: number }

const nowISO = () => new Date().toISOString()

function statusFromEff(eff: number): Building["status"] {
  if (eff >= 0.9) return "ok"
  if (eff >= 0.75) return "warn"
  return "critical"
}

export const buildings: Building[] = [
  {
    id: "bld-ch-01",
    name: "CH-A",
    city: "Chennai",
    capacityKw: 1200,
    expectedKw: 860,
    actualKw: 712,
    efficiency: 712 / 860,
    status: statusFromEff(712 / 860),
    lastUpdated: nowISO(),
    coords: { lat: 40.758, lng: -73.9855 },
  },
  {
    id: "bld-th-01",
    name: "Th-A",
    city: "Thiruvallur",
    capacityKw: 980,
    expectedKw: 730,
    actualKw: 710,
    efficiency: 710 / 730,
    status: statusFromEff(710 / 730),
    lastUpdated: nowISO(),
    coords: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: "bld-ka-01",
    name: "ABC Block",
    city: "Kancheepuram",
    capacityKw: 1050,
    expectedKw: 800,
    actualKw: 590,
    efficiency: 590 / 800,
    status: statusFromEff(590 / 800),
    lastUpdated: nowISO(),
    coords: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: "bld-che-01",
    name: "Lakeshore Campus",
    city: "Chengalpet",
    capacityKw: 1100,
    expectedKw: 810,
    actualKw: 725,
    efficiency: 725 / 810,
    status: statusFromEff(725 / 810),
    lastUpdated: nowISO(),
    coords: { lat: 41.8781, lng: -87.6298 },
  },
  {
    id: "bld-tri-01",
    name: "Trinity Park Hub",
    city: "Trichy",
    capacityKw: 900,
    expectedKw: 670,
    actualKw: 510,
    efficiency: 510 / 670,
    status: statusFromEff(510 / 670),
    lastUpdated: nowISO(),
    coords: { lat: 32.7767, lng: -96.797 },
  },
]

// Generate mock hourly series for the last 24 hours
export function generateTimeseries(seed = 0): TimeseriesPoint[] {
  const out: TimeseriesPoint[] = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = d.getHours()
    // bell curve for daylight: max around midday
    const daylightFactor = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
    const expected = Math.round(800 * daylightFactor + 50)
    // add variance
    const variance = (Math.sin((i + seed) * 1.3) + Math.cos((i + seed) * 0.7)) * 30
    const actual = Math.max(0, Math.round(expected * (0.8 + 0.2 * Math.random()) + variance))
    out.push({ t: d.toISOString(), expected, actual })
  }
  return out
}
