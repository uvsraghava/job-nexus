"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios" // Ensure axios is installed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock } from "lucide-react"

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("Attempting Login for:", email);
      
      // ⚠️ HARDCODED LOCALHOST URL - This cannot go to Cloud
      const res = await axios.post("https://job-nexus-f3ub.onrender.com/api/auth/login", {
        email,
        password
      })

      console.log("Login Success:", res.data);

      // Save Local Token
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.user.role)
      localStorage.setItem("name", res.data.user.name || "User")

      // Redirect
      if (res.data.user.role === "faculty") router.push("/dashboard/faculty")
      else if (res.data.user.role === "recruiter") router.push("/dashboard/recruiter")
      else router.push("/dashboard/student")

    } catch (err: any) {
      console.error("Login Error:", err)
      setError(err.response?.data?.msg || "Login failed. Is Local Backend (5001) running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card transition-all">
      <CardHeader><CardTitle>Login (Port 5001)</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input name="email" id="email" type="email" placeholder="drssm@gmail.com" className="pl-9" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input name="password" id="password" type="password" className="pl-9" required />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500">
            {loading ? "Connecting to Localhost..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-gray-400">
             New? <Link href="/register" className="text-blue-400 hover:underline">Create Account</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}