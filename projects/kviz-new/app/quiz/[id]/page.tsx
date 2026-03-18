// app/quiz/[id]/page.tsx — server-side HTTP 302 redirect na watch stránku
import { redirect } from 'next/navigation'

export default async function QuizRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/watch/${id}`)
}
