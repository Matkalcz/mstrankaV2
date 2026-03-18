// lib/export/pptx-exporter.ts
import pptxgen from "pptxgenjs"
import { QuestionData } from "@/components/universal-quiz-renderer"
import { QuizConfig } from "@/lib/sequence-generator"

export type ExportOptions = {
  title: string
  author?: string
  company?: string
  theme?: 'light' | 'dark' | 'colorful'
  includeAnswers: boolean
  includeNotes: boolean
  slideSize: '4:3' | '16:9' | 'widescreen'
}

export type ExportResult = {
  success: boolean
  fileName: string
  fileSize: number
  slideCount: number
  downloadUrl?: string
  error?: string
}

/**
 * Exporter pro generování PPTX prezentací z kvízu
 */
export class PPTXExporter {
  private pptx: any
  private options: ExportOptions
  
  constructor(options: Partial<ExportOptions> = {}) {
    this.pptx = new pptxgen()
    this.options = {
      title: 'Kvíz prezentace',
      author: 'Hospodský Kvíz System',
      company: '',
      theme: 'colorful',
      includeAnswers: true,
      includeNotes: true,
      slideSize: '16:9',
      ...options
    }
    
    this.configurePresentation()
  }
  
  /**
   * Konfigurace základního nastavení prezentace
   */
  private configurePresentation() {
    // Nastavit základní vlastnosti
    this.pptx.author = this.options.author
    this.pptx.company = this.options.company
    this.pptx.title = this.options.title
    
    // Nastavit velikost slidů
    switch (this.options.slideSize) {
      case '4:3':
        this.pptx.layout = 'LAYOUT_4x3'
        break
      case '16:9':
        this.pptx.layout = 'LAYOUT_16x9'
        break
      case 'widescreen':
        this.pptx.layout = 'LAYOUT_WIDE'
        break
    }
    
    // Nastavit téma barev
    this.configureTheme()
  }
  
  /**
   * Konfigurace barevného tématu
   */
  private configureTheme() {
    const themes = {
      light: {
        background: 'FFFFFF',
        text: '000000',
        primary: '0070C0',
        secondary: '00B050',
        accent: 'FFC000'
      },
      dark: {
        background: '2D2D2D',
        text: 'FFFFFF',
        primary: '5B9BD5',
        secondary: '70AD47',
        accent: 'FFC000'
      },
      colorful: {
        background: 'F0F0F0',
        text: '333333',
        primary: 'E74C3C', // Červená
        secondary: '3498DB', // Modrá
        accent: 'F39C12' // Oranžová
      }
    }
    
    const theme = themes[this.options.theme || 'colorful']
    
    // Definovat barevné schéma
    this.pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: theme.background },
      objects: [
        // Logo v pravém horním rohu
        {
          placeholder: {
            options: {
              name: 'logo',
              type: 'body',
              x: 0.5,
              y: 0.2,
              w: 1,
              h: 0.5
            },
            text: '🎯 Kvíz'
          }
        },
        // Zápatí s číslem stránky
        {
          placeholder: {
            options: {
              name: 'footer',
              type: 'ftr',
              x: 0,
              y: 6.8,
              w: '100%',
              h: 0.3
            },
            text: `{slideNum} / {totalSlides} | ${this.options.title}`
          }
        }
      ]
    })
  }
  
  /**
   * Exportovat kvíz jako PPTX
   */
  async exportQuiz(
    questions: QuestionData[],
    config?: QuizConfig
  ): Promise<ExportResult> {
    try {
      // Přidat titulní slide
      this.addTitleSlide(config)
      
      // Přidat slide s obsahem
      this.addTableOfContentsSlide(questions)
      
      // Přidat slid(y) pro každou otázku
      for (const question of questions) {
        await this.addQuestionSlide(question)
      }
      
      // Přidat závěrečný slide
      this.addFinalSlide()
      
      // Generovat prezentaci
      const fileName = `${this.options.title.replace(/\s+/g, '_')}_${Date.now()}.pptx`
      const buffer = await this.pptx.writeFile({ fileName: 'presentation.pptx' })
      
      // Pro browser: vytvořit download URL
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const downloadUrl = URL.createObjectURL(blob)
      
      return {
        success: true,
        fileName,
        fileSize: blob.size,
        slideCount: this.pptx.slides.length,
        downloadUrl
      }
    } catch (error) {
      console.error('PPTX export error:', error)
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        slideCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Přidat titulní slide
   */
  private addTitleSlide(config?: QuizConfig) {
    const slide = this.pptx.addSlide({ masterName: 'MASTER_SLIDE' })
    
    // Hlavní nadpis
    slide.addText(this.options.title, {
      x: 0.5,
      y: 1,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: this.getThemeColor('primary'),
      align: 'center'
    })
    
    // Podnadpis
    if (config?.subtitle) {
      slide.addText(config.subtitle, {
        x: 0.5,
        y: 2.8,
        w: 9,
        h: 0.8,
        fontSize: 28,
        color: this.getThemeColor('text'),
        align: 'center'
      })
    }
    
    // Autor
    slide.addText(`Autor: ${this.options.author}`, {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: this.getThemeColor('secondary'),
      align: 'center'
    })
    
    // Datum
    slide.addText(new Date().toLocaleDateString('cs-CZ'), {
      x: 0.5,
      y: 4.8,
      w: 9,
      h: 0.5,
      fontSize: 16,
      color: this.getThemeColor('accent'),
      align: 'center'
    })
    
    // Logo/ikona
    slide.addText('🎯', {
      x: 4.5,
      y: 0.5,
      w: 1,
      h: 1,
      fontSize: 48,
      align: 'center'
    })
  }
  
  /**
   * Přidat slide s obsahem
   */
  private addTableOfContentsSlide(questions: QuestionData[]) {
    const slide = this.pptx.addSlide({ masterName: 'MASTER_SLIDE' })
    
    slide.addText('Obsah', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: this.getThemeColor('primary')
    })
    
    // Seznam otázek
    const questionsList = questions.map((q, index) => 
      `${index + 1}. ${q.text.substring(0, 60)}${q.text.length > 60 ? '...' : ''}`
    )
    
    slide.addText(questionsList.join('\n'), {
      x: 1,
      y: 1.8,
      w: 8,
      h: 4,
      fontSize: 16,
      bullet: true,
      lineSpacing: 24,
      color: this.getThemeColor('text')
    })
    
    // Statistiky
    const stats = [
      `Počet otázek: ${questions.length}`,
      `Typy: ${this.getQuestionTypesSummary(questions)}`,
      `Exportováno: ${new Date().toLocaleString('cs-CZ')}`
    ]
    
    slide.addText(stats.join('\n'), {
      x: 1,
      y: 5.8,
      w: 8,
      h: 1,
      fontSize: 14,
      color: this.getThemeColor('secondary'),
      italic: true
    })
  }
  
  /**
   * Přidat slide pro otázku
   */
  private async addQuestionSlide(question: QuestionData) {
    const slide = this.pptx.addSlide({ masterName: 'MASTER_SLIDE' })
    
    // Hlavička s číslem otázky
    const headerText = `Otázka ${question.questionNumber || 1}${question.roundNumber ? ` (Kolo ${question.roundNumber})` : ''}`
    slide.addText(headerText, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 20,
      bold: true,
      color: this.getThemeColor('primary')
    })
    
    // Kategorie a obtížnost
    if (question.category || question.difficulty) {
      const meta = []
      if (question.category) meta.push(question.category)
      if (question.difficulty) meta.push(`Obtížnost: ${question.difficulty}`)
      
      slide.addText(meta.join(' • '), {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 0.4,
        fontSize: 14,
        color: this.getThemeColor('secondary'),
        italic: true
      })
    }
    
    // Text otázky
    slide.addText(question.text, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 1.5,
      fontSize: 24,
      bold: true,
      color: this.getThemeColor('text'),
      wrap: true
    })
    
    // Podle typu otázky přidat odpovídající obsah
    switch (question.type) {
      case 'simple':
        this.addSimpleQuestionContent(slide, question)
        break
      case 'ab':
      case 'abcdef':
        this.addMultipleChoiceContent(slide, question)
        break
      case 'bonus':
        this.addBonusQuestionContent(slide, question)
        break
      case 'audio':
      case 'video':
        this.addMediaQuestionContent(slide, question)
        break
    }
    

  }
  
  /**
   * Přidat obsah pro jednoduchou otázku
   */
  private addSimpleQuestionContent(slide: any, question: QuestionData) {
    if (this.options.includeAnswers && question.correctAnswer) {
      slide.addText('Správná odpověď:', {
        x: 0.5,
        y: 3.8,
        w: 9,
        h: 0.5,
        fontSize: 18,
        bold: true,
        color: this.getThemeColor('accent')
      })
      
      slide.addText(question.correctAnswer, {
        x: 0.5,
        y: 4.4,
        w: 9,
        h: 1,
        fontSize: 28,
        bold: true,
        color: 'E74C3C', // Červená pro odpověď
        align: 'center',
        wrap: true
      })
    }
  }
  
  /**
   * Přidat obsah pro otázku s výběrem
   */
  private addMultipleChoiceContent(slide: any, question: QuestionData) {
    if (!question.options) return
    
    // Možnosti
    const optionsY = 3.5
    question.options.forEach((option, index) => {
      const isCorrect = option.isCorrect || false
      const optionText = `${option.label}) ${option.text}`
      
      slide.addText(optionText, {
        x: 1,
        y: optionsY + (index * 0.6),
        w: 8,
        h: 0.5,
        fontSize: 20,
        color: isCorrect && this.options.includeAnswers ? '27AE60' : this.getThemeColor('text'), // Zelená pro správné
        bold: isCorrect && this.options.includeAnswers
      })
      
      // Zvýraznění správné odpovědi
      if (isCorrect && this.options.includeAnswers) {
        slide.addShape(this.pptx.ShapeType.rect, {
          x: 0.8,
          y: optionsY + (index * 0.6) - 0.1,
          w: 8.4,
          h: 0.6,
          fill: { color: 'D5F4E6' }, // Světle zelené pozadí
          line: { color: '27AE60', width: 2 } // Zelený okraj
        })
      }
    })
  }
  
  /**
   * Přidat obsah pro bonusovou otázku
   */
  private addBonusQuestionContent(slide: any, question: QuestionData) {
    if (!question.bonusAnswers) return
    
    slide.addText('Bonusové odpovědi:', {
      x: 0.5,
      y: 3.8,
      w: 9,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: this.getThemeColor('accent')
    })
    
    question.bonusAnswers.forEach((answer, index) => {
      slide.addText(`${index + 1}. ${answer}`, {
        x: 1,
        y: 4.4 + (index * 0.5),
        w: 8,
        h: 0.4,
        fontSize: 20,
        color: this.getThemeColor('text'),
        bold: this.options.includeAnswers
      })
    })
  }
  
  /**
   * Přidat obsah pro media otázku
   */
  private addMediaQuestionContent(slide: any, question: QuestionData) {
    const mediaType = question.type === 'audio' ? 'Audio' : 'Video'
    
    slide.addText(`${mediaType} otázka`, {
      x: 0.5,
      y: 3.8,
      w: 9,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: this.getThemeColor('accent')
    })
    
    if (question.mediaUrl) {
      slide.addText(`URL: ${question.mediaUrl}`, {
        x: 0.5,
        y: 4.4,
        w: 9,
        h: 0.5,
        fontSize: 14,
        color: this.getThemeColor('secondary'),
        italic: true
      })
    }
    
    if (this.options.includeAnswers && question.correctAnswer) {
      slide.addText(`Odpověď: ${question.correctAnswer}`, {
        x: 0.5,
        y: 5,
        w: 9,
        h: 0.5,
        fontSize: 22,
        bold: true,
        color: 'E74C3C'
      })
    }
    
    // Ikona podle typu media
    const icon = question.type === 'audio' ? '🎵' : '🎬'
    slide.addText(icon, {
      x: 4.5,
      y: 5.5,
      w: 1,
      h: 1,
      fontSize: 48,
      align: 'center'
    })
  }
  
  /**
   * Přidat závěrečný slide
   */
  private addFinalSlide() {
    const slide = this.pptx.addSlide({ masterName: 'MASTER_SLIDE' })
    
    slide.addText('Děkujeme za pozornost!', {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: this.getThemeColor('primary'),
      align: 'center'
    })
    
    slide.addText('Hospodský Kvíz System', {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: this.getThemeColor('secondary'),
      align: 'center'
    })
    
    slide.addText('www.kviz.michaljanda.com', {
      x: 0.5,
      y: 5,
      w: 9,
      h: 0.6,
      fontSize: 20,
      color: this.getThemeColor('accent'),
      align: 'center'
    })
    
    slide.addText('🎯', {
      x: 4.5,
      y: 6,
      w: 1,
      h: 1,
      fontSize: 64,
      align: 'center'
    })
  }
  
  /**
   * Získat barvu podle tématu
   */
  private getThemeColor(type: 'background' | 'text' | 'primary' | 'secondary' | 'accent'): string {
    const themes = {
      light: {
        background: 'FFFFFF',
        text: '000000',
        primary: '0070C0',
        secondary: '00B050',
        accent: 'FFC000'
      },
      dark: {
        background: '2D2D2D',
        text: 'FFFFFF',
        primary: '5B9BD5',
        secondary: '70AD47',
        accent: 'FFC000'
      },
      colorful: {
        background: 'F0F0F0',
        text: '333333',
        primary: 'E74C3C',
        secondary: '3498DB',
        accent: 'F39C12'
      }
    }
    
    const theme = themes[this.options.theme || 'colorful']
    return theme[type]
  }
  
  /**
   * Získat souhrn typů otázek
   */
  private getQuestionTypesSummary(questions: QuestionData[]): string {
    const typeCounts: Record<string, number> = {}
    
    questions.forEach(q => {
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1
    })
    
    return Object.entries(typeCounts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ')
  }
  
  /**
   * Exportovat demo prezentaci
   */
  static async exportDemo(): Promise<ExportResult> {
    const demoQuestions: QuestionData[] = [
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
      },
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
      }
    ]
    
    const exporter = new PPTXExporter({
      title: 'Demo Kvíz Prezentace',
      author: 'Hospodský Kvíz System',
      theme: 'colorful',
      includeAnswers: true,
      includeNotes: true,
      slideSize: '16:9'
    })
    
    return exporter.exportQuiz(demoQuestions, {
      title: 'Demo Kvíz',
      subtitle: 'Ukázka všech typů otázek',
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
        name: 'Demo kolo',
        questions: demoQuestions
      }]
    })
  }
}
