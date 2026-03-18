// lib/sequence-generator.ts
import { QuestionData } from "@/components/universal-quiz-renderer"
import { Slide } from "@/components/SimpleQuizPlayer"
import { adaptQuestion } from "./manual-sequence-adapter"

export type QuizConfig = {
  // Základní nastavení
  title: string
  subtitle?: string
  author?: string
  
  // Časování
  defaultQuestionDuration: number // ms
  defaultAnswerDuration: number // ms
  introDuration: number // ms
  separatorDuration: number // ms
  outroDuration: number // ms
  
  // Průběh
  showIntro: boolean
  showSeparators: boolean
  showOutro: boolean
  autoAdvance: boolean
  
  // Kola
  rounds: RoundConfig[]
}

export type RoundConfig = {
  number: number
  name?: string
  questions: QuestionData[]
  showRoundSeparator?: boolean
  roundSeparatorText?: string
}

export type GeneratedSequence = {
  slides: Slide[]
  totalDuration: number // ms
  questionCount: number
  roundCount: number
}

/**
 * Generátor sekvencí slidů pro kvíz
 */
export class SequenceGenerator {
  /**
   * Vygeneruje sekvenci slidů z konfigurace kvízu
   */
  static generateSequence(config: QuizConfig): GeneratedSequence {
    const slides: Slide[] = []
    let totalDuration = 0
    
    // Intro slide
    if (config.showIntro) {
      slides.push({
        id: 'intro',
        type: 'intro',
        duration: config.introDuration,
        autoAdvance: config.autoAdvance
      })
      totalDuration += config.introDuration
    }
    
    // Projít všechna kola
    for (const round of config.rounds) {
      // Separátor kola (pokud je povolený a není první kolo)
      if (config.showSeparators && round.showRoundSeparator !== false && round.number > 1) {
        slides.push({
          id: `round-separator-${round.number}`,
          type: 'separator',
          duration: config.separatorDuration,
          autoAdvance: config.autoAdvance
        })
        totalDuration += config.separatorDuration
      }
      
      // Otázky v kole
      for (const question of round.questions) {
        // Vytvořit slide pro otázku
        const questionSlide = this.createQuestionSlide(question, config, round.number)
        slides.push(questionSlide)
        totalDuration += questionSlide.duration
        
        // Separátor mezi otázkou a odpovědí (pokud je povolený)
        if (config.showSeparators && question.type !== 'bonus') {
          const separatorSlide = this.createAnswerSeparatorSlide(config)
          slides.push(separatorSlide)
          totalDuration += separatorSlide.duration
        }
      }
    }
    
    // Outro slide
    if (config.showOutro) {
      slides.push({
        id: 'outro',
        type: 'outro',
        duration: config.outroDuration,
        autoAdvance: config.autoAdvance
      })
      totalDuration += config.outroDuration
    }
    
    return {
      slides,
      totalDuration,
      questionCount: config.rounds.reduce((sum, round) => sum + round.questions.length, 0),
      roundCount: config.rounds.length
    }
  }
  
  /**
   * Vytvoří slide pro otázku
   */
  private static createQuestionSlide(
    question: QuestionData, 
    config: QuizConfig, 
    roundNumber: number
  ): Slide {
    // Nastavit číslo otázky a kola
    question.questionNumber = question.questionNumber || 1
    question.roundNumber = roundNumber
    
    // Vypočítat délku podle typu otázky
    let duration = config.defaultQuestionDuration
    
    switch (question.type) {
      case 'simple':
        // Otázka + odpověď
        duration = config.defaultQuestionDuration + config.defaultAnswerDuration
        break
        
      case 'ab':
      case 'abcdef':
        // Otázka + možnosti + správná odpověď
        duration = config.defaultQuestionDuration + (config.defaultQuestionDuration * 0.5) + config.defaultAnswerDuration
        break
        
      case 'bonus':
        // Otázka + postupně všechny odpovědi
        const answerCount = question.bonusAnswers?.length || 1
        duration = config.defaultQuestionDuration + (config.defaultAnswerDuration * answerCount)
        break
        
      case 'audio':
      case 'video':
        // Otázka + media přehrání + odpověď
        // Předpokládáme, že media trvá ~30 sekund
        const mediaDuration = 30000
        duration = config.defaultQuestionDuration + mediaDuration + config.defaultAnswerDuration
        break
    }
    
    return {
      id: `question-${question.id || `${roundNumber}-${question.questionNumber}`}`,
      type: 'question',
      question: adaptQuestion(question),
      duration,
      autoAdvance: config.autoAdvance
    }
  }
  
  /**
   * Vytvoří separátor pro odpovědi
   */
  private static createAnswerSeparatorSlide(config: QuizConfig): Slide {
    return {
      id: `answer-separator-${Date.now()}`,
      type: 'separator',
      duration: config.separatorDuration,
      autoAdvance: config.autoAdvance
    }
  }
  
  /**
   * Vytvoří demo sekvenci pro testování
   */
  static createDemoSequence(): GeneratedSequence {
    const demoConfig: QuizConfig = {
      title: "Demo Kvíz",
      subtitle: "Test všech typů otázek",
      author: "Hospodský Kvíz System",
      
      defaultQuestionDuration: 10000, // 10 sekund na otázku
      defaultAnswerDuration: 8000,    // 8 sekund na odpověď
      introDuration: 5000,           // 5 sekund intro
      separatorDuration: 3000,       // 3 sekundy separátor
      outroDuration: 5000,           // 5 sekund outro
      
      showIntro: true,
      showSeparators: true,
      showOutro: true,
      autoAdvance: true,
      
      rounds: [
        {
          number: 1,
          name: "Základní kolo",
          questions: [
            {
              id: 'demo-1',
              text: 'Jaké je hlavní město České republiky?',
              type: 'simple',
              correctAnswer: 'Praha',
              questionNumber: 1,
              roundNumber: 1,
              category: 'Zeměpis',
              difficulty: 'easy'
            },
            {
              id: 'demo-2',
              text: 'Který z těchto jazyků je programovací jazyk?',
              type: 'abcdef',
              options: [
                { label: 'A', text: 'Python', isCorrect: true },
                { label: 'B', text: 'Francouzština' },
                { label: 'C', text: 'HTML' },
                { label: 'D', text: 'CSS' },
                { label: 'E', text: 'JavaScript', isCorrect: true },
                { label: 'F', text: 'Ruský' }
              ],
              questionNumber: 2,
              roundNumber: 1,
              category: 'Informatika',
              difficulty: 'medium'
            },
            {
              id: 'demo-3',
              text: 'Bonusová otázka: Uveďte 3 barvy české vlajky',
              type: 'bonus',
              bonusAnswers: ['Bílá', 'Červená', 'Modrá'],
              questionNumber: 3,
              roundNumber: 1,
              category: 'Vlastenectví',
              difficulty: 'easy'
            }
          ]
        },
        {
          number: 2,
          name: "Media kolo",
          showRoundSeparator: true,
          roundSeparatorText: "MEDIA KOLO",
          questions: [
            {
              id: 'demo-4',
              text: 'Poslechněte si tuto píseň a uhodněte interpreta',
              type: 'audio',
              correctAnswer: 'Karel Gott',
              questionNumber: 4,
              roundNumber: 2,
              category: 'Hudba',
              difficulty: 'hard',
              mediaUrl: 'https://example.com/audio.mp3',
              mediaType: 'audio'
            },
            {
              id: 'demo-5',
              text: 'Podívejte se na video a uhodněte, o jaký film se jedná',
              type: 'video',
              correctAnswer: 'Pelíšky',
              questionNumber: 5,
              roundNumber: 2,
              category: 'Film',
              difficulty: 'medium',
              mediaUrl: 'https://example.com/video.mp4',
              mediaType: 'video',
              thumbnailUrl: 'https://example.com/thumbnail.jpg'
            }
          ]
        }
      ]
    }
    
    return this.generateSequence(demoConfig)
  }
  
  /**
   * Vytvoří sekvenci z existujících otázek
   */
  static createSequenceFromQuestions(
    questions: QuestionData[],
    config: Partial<QuizConfig> = {}
  ): GeneratedSequence {
    const defaultConfig: QuizConfig = {
      title: "Kvíz z otázek",
      subtitle: "Automaticky generovaný kvíz",
      
      defaultQuestionDuration: 10000,
      defaultAnswerDuration: 8000,
      introDuration: 5000,
      separatorDuration: 3000,
      outroDuration: 5000,
      
      showIntro: true,
      showSeparators: true,
      showOutro: true,
      autoAdvance: true,
      
      rounds: [{
        number: 1,
        questions: questions.map((q, index) => ({
          ...q,
          questionNumber: index + 1,
          roundNumber: 1
        }))
      }]
    }
    
    const mergedConfig = { ...defaultConfig, ...config }
    return this.generateSequence(mergedConfig)
  }
  
  /**
   * Exportuje sekvenci do JSON pro uložení
   */
  static exportToJson(sequence: GeneratedSequence): string {
    return JSON.stringify(sequence, null, 2)
  }
  
  /**
   * Importuje sekvenci z JSON
   */
  static importFromJson(json: string): GeneratedSequence {
    return JSON.parse(json)
  }
  
  /**
   * Vypočítá odhadovaný čas trvání kvízu
   */
  static estimateDuration(config: QuizConfig): number {
    const sequence = this.generateSequence(config)
    return sequence.totalDuration
  }
  
  /**
   * Formátuje délku trvání na čitelný řetězec
   */
  static formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes} min ${seconds} sec`
    }
    return `${seconds} sec`
  }
}