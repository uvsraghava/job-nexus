"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NavBar } from "@/components/nav-bar"
import { RoleCard } from "@/components/role-card"
import { GraduationCap, Briefcase, ShieldCheck } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(80%_60%_at_50%_-10%,_color-mix(in_oklch,var(--gradient-end)_12%,transparent),_transparent)]">
      <NavBar />
      <section className="relative">
        <div className="gradient-header">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 text-primary-foreground">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">
                  Interactive Job & Internship Platform for Technical Education
                </h1>
                <p className="mt-3 text-pretty text-sm/6 opacity-90">
                  Connect students, recruiters, and faculty with streamlined workflows: applications, verification,
                  postings, and analytics — all in one place.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild>
                    <Link href="/register">Create Account</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-xl bg-background/20 p-6 glass-card">
                <ul className="grid gap-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/60">
                      <GraduationCap className="h-4 w-4 text-primary" aria-hidden />
                    </span>
                    <p>Students: build profiles, upload resumes, and apply with tracking.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/60">
                      <Briefcase className="h-4 w-4 text-primary" aria-hidden />
                    </span>
                    <p>Recruiters: post roles, manage applicants, and schedule interviews.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-background/60">
                      <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                    </span>
                    <p>Faculty: verify users, post announcements, and review placement analytics.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mx-auto -mt-8 w-full max-w-7xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <RoleCard
              href="/student"
              title="Student"
              description="Profile, resume upload, recommended roles, and application tracking."
              icon={GraduationCap}
            />
            <RoleCard
              href="/recruiter"
              title="Recruiter"
              description="Company profile, post jobs/internships, view applicants, schedule interviews."
              icon={Briefcase}
            />
            <RoleCard
              href="/faculty"
              title="Faculty / Admin"
              description="Verify users, publish announcements, and monitor placement analytics."
              icon={ShieldCheck}
            />
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Visit{" "}
              <a className="underline decoration-dotted underline-offset-4" href="#docs">
                docs
              </a>{" "}
              or contact support.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
