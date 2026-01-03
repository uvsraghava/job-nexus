"use client"

import { NavBar } from "@/components/nav-bar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, Megaphone, BarChart3, CheckCircle2, Clock } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const placementData = [
  { month: "Jan", placed: 12, active: 60 },
  { month: "Feb", placed: 18, active: 70 },
  { month: "Mar", placed: 25, active: 65 },
  { month: "Apr", placed: 31, active: 58 },
  { month: "May", placed: 40, active: 52 },
  { month: "Jun", placed: 46, active: 47 },
]

export default function FacultyDashboard() {
  const items = [
    { href: "/faculty", label: "Overview", icon: ShieldCheck },
    { href: "/faculty#verify", label: "Verifications", icon: CheckCircle2 },
    { href: "/faculty#announce", label: "Announcements", icon: Megaphone },
    { href: "/faculty#analytics", label: "Analytics", icon: BarChart3 },
  ]
  return (
    <main className="min-h-dvh">
      <NavBar />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr]">
        <DashboardSidebar items={items} />
        <section className="grid gap-6">
          {/* Verification requests */}
          <Card id="verify" className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle className="text-base">Verification Requests</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                { name: "Dylan Patel", type: "Student" },
                { name: "Nova Labs", type: "Recruiter" },
                { name: "Ivy Chen", type: "Student" },
                { name: "CloudCore", type: "Recruiter" },
              ].map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-md border p-3">
                  <div className="text-sm">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Reject
                    </Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card id="announce" className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle className="text-base">Announcements</CardTitle>
              </div>
              <Button size="sm" variant="outline">
                History
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2 space-y-3">
                <Input placeholder="Title" />
                <Textarea placeholder="Share placement drives, deadlines, or policy updates..." />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Publish</Button>
              </div>
              <div className="md:col-span-3 grid gap-2">
                <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>Annual Career Fair on Sept 20</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> 2 days ago
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>Resume Workshop recording uploaded</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> 1 week ago
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card id="analytics" className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle className="text-base">Placement Analytics</CardTitle>
              </div>
              <Button size="sm" variant="outline">
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className="h-64"
                config={{
                  placed: { label: "Placed", color: "hsl(var(--chart-1))" },
                  active: { label: "Active Search", color: "hsl(var(--chart-2))" },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={placementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="placed" stroke="var(--color-placed)" strokeWidth={2} />
                    <Line type="monotone" dataKey="active" stroke="var(--color-active)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Total Placed</p>
                  <p className="text-lg font-semibold">172</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Avg Time to Offer</p>
                  <p className="text-lg font-semibold">24 days</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Active Students</p>
                  <p className="text-lg font-semibold">312</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
