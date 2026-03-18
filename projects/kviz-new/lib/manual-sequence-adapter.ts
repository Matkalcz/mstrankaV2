// lib/manual-sequence-adapter.ts
// Adaptér pro převod slidů z SequenceGenerator na formát pro ManualQuizController

import { Slide as AutoSlide } from "@/components/SimpleQuizPlayer"
import { Slide as ManualSlide } from "@/components/QuizController"
import { QuestionData as AutoQuestionData } from "@/components/universal-quiz-renderer"

/**
 * Převádí otázky z automatického formátu na manuální formát
 */
export function adaptQuestion(question: any): any {
  if (!question) return null
  
  // Pokud už má nový formát, vrátit přímo
  if (question.answers && (question.type === 'simple' || question.type === 'abcd' || question.type === 'abcdef' || question.type === 'bonus' || question.type === 'audio' || question.type === 'video')) {
    return question
  }
  
  // Adaptace ze starého formátu
  const adapted: any = {
    id: question.id || '',
    text: question.text || '',
    type: question.type || 'simple',
    answers: [],
    correctAnswer: 0,
    points: question.points || 1,
    category: question.category,
    difficulty: question.difficulty
  }
  
  // Pro simple otázky
  if (question.type === 'simple' && question.correctAnswer) {
    adapted.answers = [question.correctAnswer]
    adapted.correctAnswer = 0
  }
  
  // Pro ab/abcdef otázky
  if ((question.type === 'ab' || question.type === 'abcdef') && question.options) {
    adapted.answers = question.options.map((opt: any) => opt.text)
    // Najít správnou odpověď
    const correctIndex = question.options.findIndex((opt: any) => opt.isCorrect)
    adapted.correctAnswer = correctIndex >= 0 ? correctIndex : 0
  }
  
  // Pro bonus otázky
  if (question.type === 'bonus' && question.bonusAnswers) {
    adapted.answers = question.bonusAnswers
    adapted.correctAnswer = Array.from({ length: question.bonusAnswers.length }, (_, i) => i)
  } else if (question.type === 'bonus' && question.answerParts) {
    // Starý formát s answerParts
    adapted.answers = question.answerParts
    adapted.correctAnswer = Array.from({ length: question.answerParts.length }, (_, i) => i)
  }
  
  // Pro audio/video otázky
  if ((question.type === 'audio' || question.type === 'video') && question.correctAnswer) {
    adapted.answers = [question.correctAnswer]
    adapted.correctAnswer = 0
    adapted.mediaUrl = question.mediaUrl
  }
  
  return adapted
}

/**
 * Převádí slid(y) z automatického formátu na manuální formát
 */
export function adaptSlidesForManualController(autoSlides: AutoSlide[]): ManualSlide[] {
  return autoSlides.map((slide, index) => {
    const baseSlide: ManualSlide = {
      id: slide.id,
      type: slide.type as any,
      duration: 0, // manuální přechod
      autoAdvance: false
    }
    
    // Adaptovat otázku pokud existuje
    if (slide.question) {
      baseSlide.question = adaptQuestion(slide.question)
    }
    
    return baseSlide
  })
}

/**
 * Vytvoří demo sekvenci slidů pro manuální controller
 */
export function createDemoManualSlides(): ManualSlide[] {
  return [
    {
      id: 'intro',
      type: 'intro',
      duration: 0,
      autoAdvance: false
    },
    {
      id: 'q1',
      type: 'question',
      duration: 0,
      autoAdvance: false,
      question: {
        id: 'q1',
        type: 'simple',
        text: "Které pivo se vaří v Plzni?",
        answers: ["Plzeňský Prazdroj"],
        correctAnswer: 0,
        points: 1,
        category: "Piva",
        difficulty: "easy"
      }
    },
    {
      id: 'separator-1',
      type: 'separator',
      duration: 0,
      autoAdvance: false
    },
    {
      id: 'q2',
      type: 'question',
      duration: 0,
      autoAdvance: false,
      question: {
        id: 'q2',
        type: 'abcdef',
        text: "Kolik stupňů má ležák?",
        answers: ["8°", "10°", "12°", "14°"],
        correctAnswer: 2,
        points: 2,
        category: "Piva",
        difficulty: "medium"
      }
    },
    {
      id: 'separator-2',
      type: 'separator',
      duration: 0,
      autoAdvance: false
    },
    {
      id: 'q3',
      type: 'question',
      duration: 0,
      autoAdvance: false,
      question: {
        id: 'q3',
        type: 'bonus',
        text: "Bonusová otázka: Která značka piva má logo s červeným jelenem?",
        answers: ["Jelen"],
        correctAnswer: [0],
        points: 3,
        category: "Piva",
        difficulty: "hard"
      }
    },
    {
      id: 'outro',
      type: 'outro',
      duration: 0,
      autoAdvance: false
    }
  ]
}
