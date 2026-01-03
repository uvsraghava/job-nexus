"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Briefcase, ShieldCheck, User, Mail, Lock } from "lucide-react"

type Role = "student" | "recruiter" | "faculty"

export function RegisterForm() {
  const [role, setRole] = useState<Role>("student")
  const [loading, setLoading] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <Card className="glass-card transition-all">
      <CardHeader>
        <CardTitle className="text-pretty">Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          {/* Role selection */}
          <div className="grid gap-2">
            <Label className="text-sm">I am a</Label>
            <RadioGroup value={role} onValueChange={(v: Role) => setRole(v)} className="grid gap-2 md:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted/50">
                <RadioGroupItem value="student" id="role-student" />
                <GraduationCap className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm">Student</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted/50">
                <RadioGroupItem value="recruiter" id="role-recruiter" />
                <Briefcase className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm">Recruiter</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted/50">
                <RadioGroupItem value="faculty" id="role-faculty" />
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm">Faculty</span>
              </label>
            </RadioGroup>
          </div>

          {/* Common fields */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm">
              Full name
            </Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input id="name" placeholder="Alex Johnson" className="pl-9" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input id="email" type="email" placeholder="you@college.edu" className="pl-9" required />
            </div>
          </div>

          {/* Conditional org field */}
          {role === "recruiter" && (
            <div className="grid gap-2">
              <Label htmlFor="company" className="text-sm">
                Company
              </Label>
              <Input id="company" placeholder="TechDept Inc." />
            </div>
          )}
          {role === "faculty" && (
            <div className="grid gap-2">
              <Label htmlFor="dept" className="text-sm">
                Department
              </Label>
              <Input id="dept" placeholder="Computer Science" />
            </div>
          )}

          <div className="grid gap-2 md:grid-cols-2">
            <div className="relative">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input id="password" type="password" placeholder="••••••••" className="pl-9" required />
              </div>
            </div>
            <div>
              <Label htmlFor="confirm" className="text-sm">
                Confirm password
              </Label>
              <Input id="confirm" type="password" placeholder="••••••••" required />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="terms" required /> I agree to the Terms and Privacy Policy
          </label>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
