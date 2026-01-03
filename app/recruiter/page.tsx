"use client"

import { NavBar } from "@/components/nav-bar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, Building2, Users, Calendar } from "lucide-react"

export default function RecruiterDashboard() {
  const items = [
    { href: "/recruiter", label: "Overview", icon: Briefcase },
    { href: "/recruiter#post", label: "Post Role", icon: Building2 },
    { href: "/recruiter#applicants", label: "Applicants", icon: Users },
    { href: "/recruiter#schedule", label: "Schedule", icon: Calendar },
  ]
  return (
    <main className="min-h-dvh">
      <NavBar />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr]">
        <DashboardSidebar items={items} />
        <section className="grid gap-6">
          {/* Company profile */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Company Name</p>
                <Input placeholder="TechDept Inc." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-xs text-muted-foreground">About</p>
                <Textarea placeholder="Describe your mission and tech stack..." />
              </div>
              <Button className="md:col-start-3 w-fit">Save</Button>
            </CardContent>
          </Card>

          {/* Post job/internship */}
          <div id="post" className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">Post a Role</CardTitle>
                </div>
                <Button size="sm" variant="outline">
                  Templates
                </Button>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Input placeholder="Job Title (e.g., Frontend Engineer)" />
                <Input placeholder="Location (Remote/On-site)" />
                <Textarea placeholder="Responsibilities, requirements, and benefits..." />
                <div className="flex gap-2">
                  <Button>Publish</Button>
                  <Button variant="outline">Save Draft</Button>
                </div>
              </CardContent>
            </Card>

            {/* Applicants */}
            <Card id="applicants" className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">Applicants</CardTitle>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Alice Johnson", "Brian Lee", "Carla Diaz"].map((name) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Shortlist</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Schedule interviews */}
          <Card id="schedule" className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle className="text-base">Schedule Interviews</CardTitle>
              </div>
              <Button size="sm" variant="outline">
                Sync Calendar
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Candidate name" />
              <Input placeholder="Date" />
              <Input placeholder="Time" />
              <Button className="md:col-start-3 w-fit">Create Invite</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
