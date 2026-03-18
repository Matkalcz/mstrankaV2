// Server Component — fetches tags + question server-side, passes as props to client form
// Eliminates all client-side fetch() calls for initial data (avoids browser-level blocking)

import { tags as tagsDB, questions as questionsDB } from "@/lib/database"
import QuestionForm, { type TagItem, type QuestionData } from "./QuestionForm"

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function NewQuestionPage({ searchParams }: Props) {
  const params = await searchParams
  const editId = params.id ?? null

  // Fetch tags server-side
  const allTags = tagsDB.getAll() as TagItem[]

  // Fetch question server-side if editing
  let question: QuestionData | null = null
  if (editId) {
    const raw = questionsDB.getById(editId) as any
    if (raw) {
      question = {
        ...raw,
        tag_ids: Array.isArray(raw.tag_ids) ? raw.tag_ids : [],
        options:
          typeof raw.options === "string"
            ? (() => { try { return JSON.parse(raw.options) } catch { return [] } })()
            : (raw.options ?? []),
      }
    }
  }

  return <QuestionForm tags={allTags} question={question} editId={editId} />
}
