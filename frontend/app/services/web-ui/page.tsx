"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WebUIPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Code className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Web Dashboard</h1>
          <p className="text-muted-foreground">Next.js frontend for AI Pen Knife</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Frontend application details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">18000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework:</span>
                <span>Next.js 14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UI Library:</span>
                <span>Shadcn UI</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>Available pages in the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="outline" className="w-full justify-start">
                Tests
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="w-full justify-start">
                Services
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

