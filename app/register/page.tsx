"use client"

import { NavBar } from "@/components/nav-bar"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(80%_60%_at_50%_-10%,_color-mix(in_oklch,var(--gradient-end)_12%,transparent),_transparent)]">
      <NavBar />
      <section className="gradient-header py-12 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">Create account</h1>
          <p className="mt-2 text-sm/6 opacity-90">Join as Student, Recruiter, or Faculty and start collaborating.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="mx-auto -mt-10 w-full max-w-2xl rounded-xl bg-background/30 p-6 glass-card">
          <RegisterForm />
        </div>
      </section>
    </main>
  )
}
