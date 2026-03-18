// app/quiz/[id]/page.tsx — přesměrování na veřejný přehrávač
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function QuizRedirect() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  useEffect(() => {
    router.replace(`/watch/${quizId}`)
  }, [quizId, router])

  return (
    <div className="min-h-screen bg-[#08090f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
