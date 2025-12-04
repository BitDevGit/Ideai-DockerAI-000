"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function QdrantPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Qdrant Vector Database</h1>
          <p className="text-muted-foreground">High-performance vector database for RAG</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Qdrant vector database details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">18003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">gRPC Port:</span>
                <span className="font-mono">18004</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600">Running</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("http://localhost:18003", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Qdrant Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What Qdrant provides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>High-performance vector search</li>
              <li>Document embedding storage</li>
              <li>Semantic search capabilities</li>
              <li>RAG (Retrieval Augmented Generation) support</li>
              <li>Scalable and production-ready</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Related services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/services/python-rag">
              <Button variant="outline" className="w-full justify-start">
                Python RAG Backend
              </Button>
            </Link>
            <Link href="/tests">
              <Button variant="outline" className="w-full justify-start">
                Run RAG Tests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

