
"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TriangleAlert, ShieldCheck } from "lucide-react"

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("");
  const [numBuildings, setNumBuildings] = useState(1);
  const [buildings, setBuildings] = useState([{ panels: "", capacity: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleBuildingChange(idx: number, field: "panels" | "capacity", value: string) {
    const updated = buildings.map((b, i) =>
      i === idx ? { ...b, [field]: value } : b
    );
    setBuildings(updated);
  }

  function handleNumBuildingsChange(val: number) {
    setNumBuildings(val);
    setBuildings(
      Array.from({ length: val }, (_, i) => buildings[i] || { panels: "", capacity: "" })
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password || !email || !phone || !city || !latitude || !longitude || !timezone) {
      setError("All fields are required.");
      return;
    }
    if (buildings.some(b => !b.panels || !b.capacity)) {
      setError("Please fill all building details.");
      return;
    }
    setSuccess("User registered successfully!");
    setError(null);
    setUsername("");
    setPassword("");
    setEmail("");
    setPhone("");
    setCity("");
    setLatitude("");
    setLongitude("");
    setTimezone("");
    setNumBuildings(1);
    setBuildings([{ panels: "", capacity: "" }]);
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto grid w-full max-w-md gap-4 py-10">
        <Card
          className="border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)] hover:border-teal-400 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)] transition"
          style={{ boxShadow: "0 0 12px 2px #0ff, 0 0 2px 1px #222" }}
        >
          <CardHeader>
            <CardTitle className="text-balance text-lg text-zinc-100">Register Admin</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter details to create a new administrative user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-3 border-red-900 bg-red-950 text-red-200">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {success ? (
              <Alert className="mb-3 border-teal-600 bg-teal-950 text-teal-200">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            ) : null}
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-zinc-300">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400 focus:border-gray-400 focus:shadow-[0_0_8px_2px_rgba(200,200,200,0.7)] transition" style={{ boxShadow: "0 0 8px 2px #aaa" }} autoComplete="username" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400 focus:border-gray-400 focus:shadow-[0_0_8px_2px_rgba(200,200,200,0.7)] transition" style={{ boxShadow: "0 0 8px 2px #aaa" }} autoComplete="new-password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" autoComplete="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-zinc-300">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" autoComplete="tel" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-zinc-300">City</Label>
                <Input id="city" value={city} onChange={e => setCity(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" autoComplete="off" placeholder="e.g. nyc, la, sf, chi, dal" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="latitude" className="text-zinc-300">Latitude</Label>
                <Input id="latitude" value={latitude} onChange={e => setLatitude(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" autoComplete="off" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude" className="text-zinc-300">Longitude</Label>
                <Input id="longitude" value={longitude} onChange={e => setLongitude(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" autoComplete="off" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone" className="text-zinc-300">Timezone</Label>
                <Input id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" autoComplete="off" placeholder="e.g. America/New_York" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numBuildings" className="text-zinc-300">Number of Buildings</Label>
                <Input id="numBuildings" type="number" min={1} value={numBuildings} onChange={e => handleNumBuildingsChange(Number(e.target.value))} className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400" />
              </div>
              {buildings.map((b, idx) => (
                <div key={idx} className="grid gap-2 border border-zinc-700 rounded-md p-2 mt-2">
                  <Label className="text-zinc-400">Building {idx + 1}</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Number of panels"
                    value={b.panels}
                    onChange={e => handleBuildingChange(idx, "panels", e.target.value)}
                    className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Installed capacity (kW)"
                    value={b.capacity}
                    onChange={e => handleBuildingChange(idx, "capacity", e.target.value)}
                    className="border-2 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>
              ))}
              <Button className="bg-teal-600 text-black hover:bg-teal-500">Register</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
