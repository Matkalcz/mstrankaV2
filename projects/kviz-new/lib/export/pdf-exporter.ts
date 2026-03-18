// lib/export/pdf-exporter.ts
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { QuestionData } from "@/components/universal-quiz-renderer"
import { QuizConfig } from "@/lib/sequence-generator"

export type PDFExportOptions = {
  title: string
  author?: string
  subject?: string
  keywords?: string[]
  includeAnswers: boolean
  includeQuestions: boolean
  pageSize: 'A4' | 'A3' | 'letter'
  orientation: 'portrait' | 'landscape'
  margin: number
  quality: number // 0-1
}

export type PDFExportResult = {
  success: boolean
  fileName: string
  fileSize: number
  pageCount: number
  downloadUrl?: string
  error?: string
}

/**
 * Exporter pro generování PDF z kvízu
 */
export class PDFExporter {
  private options: PDFExportOptions
  
  constructor(options: Partial<PDFExportOptions> = {}) {
    this.options = {
      title: 'Kvíz Export',
      author: 'Hospodský Kvíz System',
      subject: 'Hospodský kvíz',
      keywords: ['kvíz', 'hospoda', 'otázky', 'zábava'],
      includeAnswers: true,
      includeQuestions: true,
      pageSize: 'A4',
      orientation: 'portrait',
      margin: 20,
      quality: 0.95,
      ...options
    }
  }
  
  /**
   * Exportovat kvíz jako PDF z HTML elementu
   */
  async exportFromElement(
    element: HTMLElement,
    questions: QuestionData[]
  ): Promise<PDFExportResult> {
    try {
      const pdf = new jsPDF({
        orientation: this.options.orientation,
        unit: 'mm',
        format: this.options.pageSize
      })
      
      // Metadata
      pdf.setProperties({
        title: this.options.title,
        author: this.options.author || '',
        subject: this.options.subject || '',
        keywords: this.options.keywords?.join(', ') || ''
      })
      
      // Přidat titulní stránku
      this.addTitlePage(pdf, questions)
      
      // Přidat obsah
      this.addTableOfContents(pdf, questions)
      
      // Exportovat každou otázku
      for (let i = 0; i < questions.length; i++) {
        this.addQuestionDataPage(pdf, questions[i], i + 1)
        
        // Přidat novou stránku (pokud není poslední)
        if (i < questions.length - 1) {
          pdf.addPage()
        }
      }
      
      // Přidat závěrečnou stránku
      this.addFinalPage(pdf, questions)
      
      // Generovat PDF
      const fileName = `${this.options.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      const pdfData = pdf.output('arraybuffer')
      const blob = new Blob([pdfData], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      
      return {
        success: true,
        fileName,
        fileSize: blob.size,
        pageCount: pdf.getNumberOfPages(),
        downloadUrl
      }
    } catch (error) {
      console.error('PDF export error:', error)
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        pageCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Exportovat kvíz jako PDF z dat (bez HTML)
   */
  async exportFromData(questions: QuestionData[]): Promise<PDFExportResult> {
    try {
      const pdf = new jsPDF({
        orientation: this.options.orientation,
        unit: 'mm',
        format: this.options.pageSize
      })
      
      // Metadata
      pdf.setProperties({
        title: this.options.title,
        author: this.options.author || '',
        subject: this.options.subject || '',
        keywords: this.options.keywords?.join(', ') || ''
      })
      
      // Přidat titulní stránku
      this.addTitlePage(pdf, questions)
      
      // Přidat obsah
      this.addTableOfContents(pdf, questions)
      
      // Přidat stránky s otázkami
      for (let i = 0; i < questions.length; i++) {
        this.addQuestionDataPage(pdf, questions[i], i + 1)
        
        // Přidat novou stránku (pokud není poslední)
        if (i < questions.length - 1) {
          pdf.addPage()
        }
      }
      
      // Přidat závěrečnou stránku
      this.addFinalPage(pdf, questions)
      
      // Generovat PDF
      const fileName = `${this.options.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      const pdfData = pdf.output('arraybuffer')
      const blob = new Blob([pdfData], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      
      return {
        success: true,
        fileName,
        fileSize: blob.size,
        pageCount: pdf.getNumberOfPages(),
        downloadUrl
      }
    } catch (error) {
      console.error('PDF export error:', error)
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        pageCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Přidat titulní stránku
   */
  private addTitlePage(pdf: jsPDF, questions: QuestionData[]) {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Pozadí
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    
    // Hlavní nadpis
    pdf.setFontSize(36)
    pdf.setTextColor(231, 76, 60) // Červená
    pdf.text(this.options.title, pageWidth / 2, 50, { align: 'center' })
    
    // Podnadpis
    pdf.setFontSize(18)
    pdf.setTextColor(52, 152, 219) // Modrá
    pdf.text('Hospodský Kvíz System', pageWidth / 2, 70, { align: 'center' })
    
    // Statistiky
    pdf.setFontSize(14)
    pdf.setTextColor(44, 62, 80) // Tmavě modrá
    const stats = [
      `Počet otázek: ${questions.length}`,
      `Typy otázek: ${this.getQuestionTypesSummary(questions)}`,
      `Exportováno: ${new Date().toLocaleDateString('cs-CZ')}`,
      `Autor: ${this.options.author}`
    ]
    
    stats.forEach((stat, index) => {
      pdf.text(stat, pageWidth / 2, 90 + (index * 10), { align: 'center' })
    })
    
    // Logo/ikona
    pdf.setFontSize(48)
    pdf.setTextColor(241, 196, 15) // Zlatá
    pdf.text('🎯', pageWidth / 2, 140, { align: 'center' })
    
    // Spodní text
    pdf.setFontSize(12)
    pdf.setTextColor(127, 140, 141) // Šedá
    pdf.text('www.kviz.michaljanda.com', pageWidth / 2, pageHeight - 20, { align: 'center' })
  }
  
  /**
   * Přidat obsah
   */
  private addTableOfContents(pdf: jsPDF, questions: QuestionData[]) {
    pdf.addPage()
    
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = this.options.margin
    
    // Nadpis
    pdf.setFontSize(24)
    pdf.setTextColor(231, 76, 60) // Červená
    pdf.text('Obsah', margin, 30)
    
    pdf.setDrawColor(231, 76, 60)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 35, pageWidth - margin, 35)
    
    // Seznam otázek
    pdf.setFontSize(12)
    pdf.setTextColor(44, 62, 80) // Tmavě modrá
    
    let yPos = 50
    questions.forEach((question, index) => {
      if (yPos > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage()
        yPos = margin
      }
      
      const questionText = `${index + 1}. ${question.text.substring(0, 80)}${question.text.length > 80 ? '...' : ''}`
      pdf.text(questionText, margin + 5, yPos)
      
      // Informace o otázce
      pdf.setFontSize(10)
      pdf.setTextColor(127, 140, 141) // Šedá
      
      const info = []
      if (question.category) info.push(question.category)
      if (question.difficulty) info.push(question.difficulty)
      if (question.type) info.push(question.type)
      
      if (info.length > 0) {
        pdf.text(`(${info.join(' • ')})`, margin + 10, yPos + 5)
      }
      
      pdf.setFontSize(12)
      pdf.setTextColor(44, 62, 80)
      yPos += 15
    })
    
    // Číslo stránky
    this.addPageNumber(pdf, 2)
  }
  
  /**
   * Přidat stránku s otázkou z dat
   */
  private addQuestionDataPage(pdf: jsPDF, question: QuestionData, questionNumber: number) {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = this.options.margin
    
    // Hlavička
    pdf.setFontSize(16)
    pdf.setTextColor(52, 152, 219) // Modrá
    const header = `Otázka ${questionNumber}${question.roundNumber ? ` • Kolo ${question.roundNumber}` : ''}`
    pdf.text(header, margin, 30)
    
    // Kategorie a obtížnost
    if (question.category || question.difficulty) {
      pdf.setFontSize(10)
      pdf.setTextColor(127, 140, 141) // Šedá
      
      const meta = []
      if (question.category) meta.push(question.category)
      if (question.difficulty) meta.push(`Obtížnost: ${question.difficulty}`)
      
      pdf.text(meta.join(' • '), margin, 38)
    }
    
    // Text otázky
    pdf.setFontSize(14)
    pdf.setTextColor(44, 62, 80) // Tmavě modrá
    pdf.setFont(undefined, 'bold')
    
    const questionLines = pdf.splitTextToSize(question.text, pageWidth - (margin * 2))
    pdf.text(questionLines, margin, 50)
    
    pdf.setFont(undefined, 'normal')
    
    // Podle typu otázky
    let yPos = 50 + (questionLines.length * 7)
    
    switch (question.type) {
      case 'simple':
        yPos = this.addSimpleQuestion(pdf, question, margin, yPos)
        break
      case 'ab':
      case 'abcdef':
        yPos = this.addMultipleChoiceQuestion(pdf, question, margin, yPos)
        break
      case 'bonus':
        yPos = this.addBonusQuestion(pdf, question, margin, yPos)
        break
      case 'audio':
      case 'video':
        yPos = this.addMediaQuestion(pdf, question, margin, yPos)
        break
    }
    

    
    // Číslo stránky
    this.addPageNumber(pdf)
  }
  
  /**
   * Přidat jednoduchou otázku
   */
  private addSimpleQuestion(pdf: jsPDF, question: QuestionData, margin: number, yPos: number): number {
    if (this.options.includeAnswers && question.correctAnswer) {
      pdf.setFontSize(12)
      pdf.setTextColor(46, 204, 113) // Zelená
      pdf.setFont(undefined, 'bold')
      
      pdf.text('Správná odpověď:', margin, yPos + 15)
      
      pdf.setFontSize(16)
      const answerLines = pdf.splitTextToSize(question.correctAnswer, pdf.internal.pageSize.getWidth() - (margin * 2))
      pdf.text(answerLines, margin, yPos + 25)
      
      pdf.setFont(undefined, 'normal')
      return yPos + 25 + (answerLines.length * 7)
    }
    return yPos
  }
  
  /**
   * Přidat otázku s výběrem
   */
  private addMultipleChoiceQuestion(pdf: jsPDF, question: QuestionData, margin: number, yPos: number): number {
    if (!question.options) return yPos
    
    pdf.setFontSize(12)
    pdf.setTextColor(44, 62, 80)
    
    let currentY = yPos + 15
    
    question.options.forEach((option, index) => {
      if (currentY > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage()
        currentY = margin
      }
      
      const isCorrect = option.isCorrect || false
      const optionText = `${option.label}) ${option.text}`
      
      // Zvýraznění správné odpovědi
      if (isCorrect && this.options.includeAnswers) {
        pdf.setFillColor(220, 245, 230) // Světle zelené pozadí
        pdf.rect(margin - 2, currentY - 4, pdf.internal.pageSize.getWidth() - (margin * 2) + 4, 10, 'F')
        
        pdf.setTextColor(39, 174, 96) // Zelená
        pdf.setFont(undefined, 'bold')
      } else {
        pdf.setTextColor(44, 62, 80)
        pdf.setFont(undefined, 'normal')
      }
      
      pdf.text(optionText, margin, currentY)
      currentY += 8
    })
    
    return currentY
  }
  
  /**
   * Přidat bonusovou otázku
   */
  private addBonusQuestion(pdf: jsPDF, question: QuestionData, margin: number, yPos: number): number {
    if (!question.bonusAnswers) return yPos
    
    pdf.setFontSize(12)
    pdf.setTextColor(155, 89, 182) // Fialová
    pdf.setFont(undefined, 'bold')
    
    pdf.text('Bonusové odpovědi:', margin, yPos + 15)
    
    pdf.setFontSize(14)
    pdf.setTextColor(44, 62, 80)
    pdf.setFont(undefined, 'normal')
    
    let currentY = yPos + 25
    
    question.bonusAnswers.forEach((answer, index) => {
      pdf.text(`${index + 1}. ${answer}`, margin + 5, currentY)
      currentY += 8
    })
    
    return currentY
  }
  
  /**
   * Přidat media otázku
   */
  private addMediaQuestion(pdf: jsPDF, question: QuestionData, margin: number, yPos: number): number {
    const mediaType = question.type === 'audio' ? 'Audio' : 'Video'
    
    pdf.setFontSize(12)
    pdf.setTextColor(230, 126, 34) // Oranžová
    pdf.setFont(undefined, 'bold')
    
    pdf.text(`${mediaType} otázka`, margin, yPos + 15)
    
    pdf.setFontSize(11)
    pdf.setTextColor(127, 140, 141)
    pdf.setFont(undefined, 'normal')
    
    if (question.mediaUrl) {
      pdf.text(`URL: ${question.mediaUrl}`, margin, yPos + 25)
    }
    
    if (this.options.includeAnswers && question.correctAnswer) {
      pdf.setFontSize(14)
      pdf.setTextColor(231, 76, 60) // Červená
      pdf.setFont(undefined, 'bold')
      
      pdf.text(`Odpověď: ${question.correctAnswer}`, margin, yPos + 35)
      return yPos + 45
    }
    
    return yPos + 35
  }
  
  /**
   * Přidat závěrečnou stránku
   */
  private addFinalPage(pdf: jsPDF, questions: QuestionData[]) {
    pdf.addPage()
    
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Pozadí
    pdf.setFillColor(240, 240, 240)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    
    // Hlavní text
    pdf.setFontSize(36)
    pdf.setTextColor(231, 76, 60) // Červená
    pdf.text('Děkujeme!', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' })
    
    // Podtext
    pdf.setFontSize(18)
    pdf.setTextColor(52, 152, 219) // Modrá
    pdf.text('Hospodský Kvíz System', pageWidth / 2, pageHeight / 2, { align: 'center' })
    
    // Kontakt
    pdf.setFontSize(14)
    pdf.setTextColor(44, 62, 80) // Tmavě modrá
    pdf.text('www.kviz.michaljanda.com', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' })
    
    // Statistiky
    pdf.setFontSize(12)
    pdf.setTextColor(127, 140, 141) // Šedá
    
    const stats = [
      `Celkem otázek: ${questions.length}`,
      `Stránek v PDF: ${pdf.getNumberOfPages()}`,
      `Exportováno: ${new Date().toLocaleString('cs-CZ')}`
    ]
    
    stats.forEach((stat, index) => {
      pdf.text(stat, pageWidth / 2, pageHeight / 2 + 40 + (index * 8), { align: 'center' })
    })
    
    // Ikona
    pdf.setFontSize(48)
    pdf.setTextColor(241, 196, 15) // Zlatá
    pdf.text('🎯', pageWidth / 2, pageHeight / 2 + 70, { align: 'center' })
    
    // Číslo stránky
    this.addPageNumber(pdf)
  }
  
  /**
   * Přidat číslo stránky
   */
  private addPageNumber(pdf: jsPDF, pageNum?: number) {
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    pdf.setFontSize(10)
    pdf.setTextColor(127, 140, 141) // Šedá
    
    const currentPage = pageNum || pdf.getCurrentPageInfo().pageNumber
    const totalPages = pdf.getNumberOfPages()
    
    pdf.text(`Strana ${currentPage} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
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
      .map(([type, count]) => `${count}× ${type}`)
      .join(', ')
  }
  
  /**
   * Exportovat demo PDF
   */
  static async exportDemo(): Promise<PDFExportResult> {
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
      }
    ]
    
    const exporter = new PDFExporter({
      title: 'Demo Kvíz Export',
      author: 'Hospodský Kvíz System',
      includeAnswers: true,
      includeQuestions: true,
      pageSize: 'A4',
      orientation: 'portrait',
      margin: 20,
      quality: 0.95
    })
    
    return exporter.exportFromData(demoQuestions)
  }
}