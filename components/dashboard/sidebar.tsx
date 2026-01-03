"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

export function DashboardSidebar({
  items,
}: {
  items: { href: string; label: string; icon: LucideIcon }[]
}) {
  const pathname = usePathname()
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-background/70 backdrop-blur md:block">
      <nav className="p-4">
        <ul className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
