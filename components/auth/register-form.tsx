"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
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
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")

    try {
      console.log("Attempting Local Register for:", email);

      // ⚠️ HARDCODED LOCALHOST URL
      const res = await axios.post("https://job-nexus-f3ub.onrender.com/api/auth/register", {
        name,
        email,
        password,
        role
      })

      console.log("Register Success:", res.data);
      
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.user.role)
      localStorage.setItem("name", res.data.user.name || "User")

      if (res.data.user.role === "faculty") router.push("/dashboard/faculty")
      else if (res.data.user.role === "recruiter") router.push("/dashboard/recruiter")
      else router.push("/dashboard/student")

    } catch (err: any) {
      console.error("Register Error:", err)
      setError(err.response?.data?.msg || "Registration failed. Is Local Backend (5001) running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card transition-all">
      <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}

          {/* Role Selection */}
          <div className="grid gap-2">
            <Label>I am a</Label>
            <RadioGroup value={role} onValueChange={(v: Role) => setRole(v)} className="grid gap-2 md:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted/50">
                <RadioGroupItem value="student" /> <GraduationCap className="h-4 w-4" /> <span className="text-sm">Student</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted/50">
                <RadioGroupItem value="recruiter" /> <Briefcase className="h-4 w-4" /> <span className="text-sm">Recruiter</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-muted/50">
                <RadioGroupItem value="faculty" /> <ShieldCheck className="h-4 w-4" /> <span className="text-sm">Faculty</span>
              </label>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input name="name" id="name" placeholder="John Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" type="email" placeholder="local@college.edu" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input name="password" id="password" type="password" required />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full bg-red-600">
   TESTING LOCALHOST 123
</Button>
          <p className="text-center text-sm text-gray-400">
            Have an account? <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}