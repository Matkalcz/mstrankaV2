// app/quiz/[id]/page.tsx — Přehrávač kvízu
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ManualQuizController } from "@/components/ManualQuizController"
import { createDemoManualSlides } from "@/lib/manual-sequence-adapter"
import { DEFAULT_TEMPLATE } from "@/types/template"

export default function QuizPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Načíst skutečnou konfiguraci kvízu z API podle quizId
    const timer = setTimeout(() => {
      setSlides(createDemoManualSlides())
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [quizId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-400 text-lg">Načítání kvízu…</p>
        </div>
      </div>
    )
  }

  return (
    <ManualQuizController
      slides={slides}
      template={DEFAULT_TEMPLATE}
      showControls={true}
      onSlideChange={(index, slide) => {
        console.log("Slide changed:", index, slide.type)
      }}
      onQuizEnd={() => {
        console.log("Kvíz dokončen!")
      }}
      onClose={() => router.push("/admin/quizzes")}
    />
  )
}
