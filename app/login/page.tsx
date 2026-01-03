"use client"

import { NavBar } from "@/components/nav-bar"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(80%_60%_at_50%_-10%,_color-mix(in_oklch,var(--gradient-end)_12%,transparent),_transparent)]">
      <NavBar />
      <section className="gradient-header py-12 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">Sign in</h1>
          <p className="mt-2 text-sm/6 opacity-90">Access student, recruiter, or faculty tools from one place.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto -mt-10 w-full max-w-xl rounded-xl bg-background/30 p-6 glass-card">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
