"use client"

import { NavBar } from "@/components/nav-bar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GraduationCap, FileUp, Briefcase, ClipboardList } from "lucide-react"

export default function StudentDashboard() {
  const items = [
    { href: "/student", label: "Overview", icon: GraduationCap },
    { href: "/student#recommended", label: "Recommended", icon: Briefcase },
    { href: "/student#applications", label: "Applications", icon: ClipboardList },
  ]
  return (
    <main className="min-h-dvh">
      <NavBar />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr]">
        <DashboardSidebar items={items} />
        <section className="grid gap-6">
          {/* Profile Summary */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Student Profile</CardTitle>
                  <p className="text-xs text-muted-foreground">Computer Science · Class of 2026</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Skills</p>
                <p className="text-sm">React, TypeScript, Node.js, SQL</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interests</p>
                <p className="text-sm">Full‑stack, Data, Cloud</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm">Open to internships</p>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle className="text-base">Resume</CardTitle>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row">
              <Input type="file" className="max-w-sm" aria-label="Upload resume (PDF)" />
              <Button>Upload</Button>
            </CardContent>
          </Card>

          {/* Recommended roles */}
          <div id="recommended" className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass-card transition-all hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Frontend Intern #{i}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">TechDept · Remote · 3 months</p>
                  <Button size="sm">Apply</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Applications tracking */}
          <div id="applications" className="grid gap-4 md:grid-cols-2">
            {["Submitted", "Interviewing", "Offer"].map((stage) => (
              <Card key={stage} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">{stage}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">2 active</span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Frontend Intern</span>
                    <span className="text-muted-foreground">TechDept</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Data Analyst Intern</span>
                    <span className="text-muted-foreground">DataWorks</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
