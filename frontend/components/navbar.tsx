"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  LayoutDashboard, 
  TestTube, 
  Code, 
  Brain, 
  Zap, 
  Database, 
  Gauge, 
  BarChart3,
  FlaskConical,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tests", href: "/tests", icon: TestTube },
  { name: "Evaluation", href: "/evaluation", icon: BarChart3 },
  { name: "Guide", href: "/guide", icon: BookOpen },
  { name: "Services", href: "/services", icon: FlaskConical },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 font-bold text-lg flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          AI Pen Knife
        </Link>
        <div className="flex flex-1 items-center justify-start space-x-1 ml-8">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors px-3 py-2 rounded-md flex items-center gap-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

