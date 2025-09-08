// Abstraction over data access; replace with Flask endpoints later.
// Example for Flask: fetch('http://localhost:5000/api/buildings')
import { buildings, generateTimeseries, type Building, type TimeseriesPoint } from "@/data/buildings"

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export async function fetchBuildings(): Promise<Building[]> {
  // Fetch from MongoDB via API route
  const res = await fetch("/api/buildings");
  if (!res.ok) throw new Error("Failed to fetch buildings");
  const data = await res.json();
  return data.map((b: any) => ({
    ...b,
    lastUpdated: b.lastUpdated || new Date().toISOString(),
  }));
}

export async function fetchBuilding(id: string): Promise<Building | null> {
  await sleep(200)
  const b = buildings.find((x) => x.id === id)
  return b ? { ...b, lastUpdated: new Date().toISOString() } : null
}

export async function fetchBuildingSeries(id: string): Promise<TimeseriesPoint[]> {
  await sleep(200)
  // use stable seed based on id hash
  const seed = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return generateTimeseries(seed)
}
