"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, GraduationCap, ShieldCheck } from "lucide-react"

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md gradient-header" aria-hidden />
          <span className="text-sm font-semibold tracking-tight text-pretty">TechDept Careers</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <Link
            href="/student"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <GraduationCap className="h-4 w-4" aria-hidden />
            <span>Students</span>
          </Link>
          <Link
            href="/recruiter"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Briefcase className="h-4 w-4" aria-hidden />
            <span>Recruiters</span>
          </Link>
          <Link
            href="/faculty"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <span>Faculty</span>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
