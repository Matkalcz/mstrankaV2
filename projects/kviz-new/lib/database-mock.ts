// Mock database for testing without native SQLite
// This provides the same interface as the real database but uses in-memory storage

interface Question {
    id: string
    text: string
    type: string
    correct_answer?: string
    options?: string
    media_url?: string
    points: number
    category?: string
    difficulty?: string
    created_at: string
    updated_at: string
}

interface Quiz {
    id: string
    name: string
    description?: string
    template_id?: string
    sequence?: string
    status: string
    created_at: string
    updated_at: string
    author?: string
}

interface QuizQuestion {
    quiz_id: string
    question_id: string
    order_index: number
    round_number: number
}

interface Category {
    id: string
    name: string
    description?: string
    color: string
    icon?: string
    created_at: string
    updated_at: string
}

interface Export {
    id: string
    quiz_id: string
    format: string
    file_path?: string
    generated_at: string
    status: string
}

// In-memory storage
const questions: Question[] = []
const quizzes: Quiz[] = []
const quizQuestions: QuizQuestion[] = []
const categories: Category[] = []
const exports: Export[] = []

// Generate UUID
function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// Mock database operations
export const mockDatabase = {
    // Question operations
    questions: {
        getAll: () => [...questions],
        getById: (id: string) => questions.find(q => q.id === id),
        getByType: (type: string) => questions.filter(q => q.type === type),
        create: (data: any) => {
            const id = generateId()
            const now = new Date().toISOString()
            const question: Question = {
                id,
                text: data.text,
                type: data.type,
                correct_answer: data.correct_answer,
                options: JSON.stringify(data.options || []),
                media_url: data.media_url,
                points: data.points || 1,
                category: data.category,
                difficulty: data.difficulty || 'medium',
                created_at: now,
                updated_at: now
            }
            questions.push(question)
            return id
        },
        update: (id: string, data: any) => {
            const index = questions.findIndex(q => q.id === id)
            if (index !== -1) {
                questions[index] = {
                    ...questions[index],
                    text: data.text || questions[index].text,
                    type: data.type || questions[index].type,
                    correct_answer: data.correct_answer !== undefined ? data.correct_answer : questions[index].correct_answer,
                    options: data.options ? JSON.stringify(data.options) : questions[index].options,
                    media_url: data.media_url !== undefined ? data.media_url : questions[index].media_url,
                    points: data.points || questions[index].points,
                    category: data.category !== undefined ? data.category : questions[index].category,
                    difficulty: data.difficulty || questions[index].difficulty,
                    updated_at: new Date().toISOString()
                }
            }
        },
        delete: (id: string) => {
            const index = questions.findIndex(q => q.id === id)
            if (index !== -1) {
                questions.splice(index, 1)
            }
        }
    },

    // Quiz operations
    quizzes: {
        getAll: () => [...quizzes],
        getById: (id: string) => quizzes.find(q => q.id === id),
        create: (data: any) => {
            const id = generateId()
            const now = new Date().toISOString()
            const quiz: Quiz = {
                id,
                name: data.name,
                description: data.description,
                template_id: data.template_id,
                sequence: JSON.stringify(data.sequence || []),
                status: data.status || 'draft',
                created_at: now,
                updated_at: now,
                author: data.author || 'admin'
            }
            quizzes.push(quiz)
            return id
        },
        update: (id: string, data: any) => {
            const index = quizzes.findIndex(q => q.id === id)
            if (index !== -1) {
                quizzes[index] = {
                    ...quizzes[index],
                    name: data.name || quizzes[index].name,
                    description: data.description !== undefined ? data.description : quizzes[index].description,
                    template_id: data.template_id !== undefined ? data.template_id : quizzes[index].template_id,
                    sequence: data.sequence ? JSON.stringify(data.sequence) : quizzes[index].sequence,
                    status: data.status || quizzes[index].status,
                    updated_at: new Date().toISOString()
                }
            }
        },
        delete: (id: string) => {
            const index = quizzes.findIndex(q => q.id === id)
            if (index !== -1) {
                quizzes.splice(index, 1)
                // Remove associated quiz questions
                const qqIndex = quizQuestions.findIndex(qq => qq.quiz_id === id)
                while (qqIndex !== -1) {
                    quizQuestions.splice(qqIndex, 1)
                }
            }
        },
        addQuestion: (quizId: string, questionId: string, orderIndex: number, roundNumber: number = 1) => {
            // Remove existing if exists
            const existingIndex = quizQuestions.findIndex(qq =>
                qq.quiz_id === quizId && qq.question_id === questionId
            )
            if (existingIndex !== -1) {
                quizQuestions.splice(existingIndex, 1)
            }

            quizQuestions.push({
                quiz_id: quizId,
                question_id: questionId,
                order_index: orderIndex,
                round_number: roundNumber
            })
        },
        removeQuestion: (quizId: string, questionId: string) => {
            const index = quizQuestions.findIndex(qq =>
                qq.quiz_id === quizId && qq.question_id === questionId
            )
            if (index !== -1) {
                quizQuestions.splice(index, 1)
            }
        },
        getQuestions: (quizId: string) => {
            const qqs = quizQuestions
                .filter(qq => qq.quiz_id === quizId)
                .sort((a, b) => a.order_index - b.order_index)

            return qqs.map(qq => {
                const question = questions.find(q => q.id === qq.question_id)
                if (!question) return null

                return {
                    ...question,
                    order_index: qq.order_index,
                    round_number: qq.round_number
                }
            }).filter(Boolean)
        }
    },

    // Category operations
    categories: {
        getAll: () => [...categories],
        getById: (id: string) => categories.find(c => c.id === id),
        getByName: (name: string) => categories.find(c => c.name === name),
        create: (data: any) => {
            const id = generateId()
            const now = new Date().toISOString()
            const category: Category = {
                id,
                name: data.name,
                description: data.description,
                color: data.color || '#3b82f6',
                icon: data.icon || '',
                created_at: now,
                updated_at: now
            }
            categories.push(category)
            return id
        },
        update: (id: string, data: any) => {
            const index = categories.findIndex(c => c.id === id)
            if (index !== -1) {
                categories[index] = {
                    ...categories[index],
                    name: data.name || categories[index].name,
                    description: data.description !== undefined ? data.description : categories[index].description,
                    color: data.color || categories[index].color,
                    icon: data.icon !== undefined ? data.icon : categories[index].icon,
                    updated_at: new Date().toISOString()
                }
            }
        },
        delete: (id: string) => {
            const index = categories.findIndex(c => c.id === id)
            if (index !== -1) {
                categories.splice(index, 1)
            }
        }
    },

    // Export operations
    exports: {
        create: (quizId: string, format: string) => {
            const id = generateId()
            const now = new Date().toISOString()
            const exportRecord: Export = {
                id,
                quiz_id: quizId,
                format,
                generated_at: now,
                status: 'pending'
            }
            exports.push(exportRecord)
            return id
        },
        updateStatus: (id: string, status: string, filePath?: string) => {
            const index = exports.findIndex(e => e.id === id)
            if (index !== -1) {
                exports[index] = {
                    ...exports[index],
                    status,
                    file_path: filePath,
                    generated_at: new Date().toISOString()
                }
            }
        },
        getByQuiz: (quizId: string) => {
            return exports.filter(e => e.quiz_id === quizId)
        }
    }
}

// Add some demo data
function addDemoData() {
    // Add demo questions
    mockDatabase.questions.create({
        text: 'Jaké je hlavní město České republiky?',
        type: 'simple',
        correct_answer: 'Praha',
        category: 'Zeměpis',
        difficulty: 'easy'
    })

    mockDatabase.questions.create({
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
        category: 'Informatika',
        difficulty: 'medium'
    })

    mockDatabase.questions.create({
        text: 'Bonusová otázka: Uveďte 3 barvy české vlajky',
        type: 'bonus',
        bonusAnswers: ['Bílá', 'Červená', 'Modrá'],
        category: 'Vlastenectví',
        difficulty: 'easy'
    })

    // Add demo quiz
    const quizId = mockDatabase.quizzes.create({
        name: 'Demo Hospodský Kvíz',
        description: 'Testovací kvíz s různými typy otázek',
        status: 'published',
        author: 'admin'
    })

    // Add questions to quiz
    const allQuestions = mockDatabase.questions.getAll()
    allQuestions.forEach((q, index) => {
        mockDatabase.quizzes.addQuestion(quizId, q.id, index, 1)
    })
}

// Initialize with demo data
addDemoData()

export default mockDatabase