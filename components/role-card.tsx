"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function RoleCard({
  href,
  title,
  description,
  icon: Icon,
  className,
}: {
  href: string
  title: string
  description: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <Link
      href={href}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <Card className={cn("glass-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl", className)}>
        <CardHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md gradient-header text-primary-foreground shadow-sm">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle className="text-pretty">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
