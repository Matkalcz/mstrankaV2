import { demoQuizzes, demoQuestions, demoTemplates } from '../types/quiz'
import db from '../lib/database'

console.log('Seeding database with demo data...')

// Clear existing data (optional)
db.exec('DELETE FROM quiz_questions')
db.exec('DELETE FROM exports')
db.exec('DELETE FROM quizzes')
db.exec('DELETE FROM questions')
db.exec('DELETE FROM categories')
db.exec('DELETE FROM templates')

// Seed templates
console.log('Seeding templates...')
for (const template of demoTemplates) {
  db.prepare(`
    INSERT INTO templates (id, name, background_color, text_color, accent_color, font_family)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    template.id,
    template.name,
    template.background.color,
    template.colors.text.primary,
    template.colors.primary,
    template.fonts.question.family
  )
}

// Seed categories (demo data nemá kategorie, vytvoříme nějaké)
console.log('Seeding categories...')
const categories = [
  { id: 'cat1', name: 'Historie', description: 'Historické otázky', color: '#3b82f6', icon: '🏛️' },
  { id: 'cat2', name: 'Geografie', description: 'Zeměpisné otázky', color: '#10b981', icon: '🗺️' },
  { id: 'cat3', name: 'Zábava', description: 'Zábavné otázky', color: '#8b5cf6', icon: '🎭' },
]

for (const cat of categories) {
  db.prepare(`
    INSERT INTO categories (id, name, description, color, icon)
    VALUES (?, ?, ?, ?, ?)
  `).run(cat.id, cat.name, cat.description, cat.color, cat.icon)
}

// Seed questions
console.log('Seeding questions...')
for (const question of demoQuestions) {
  // Transformace demo otázky do databázového formátu
  let options = null
  let correctAnswer = question.text // Pro simple otázky
  
  if (question.type === 'abcdef' && question.answers.abcdef) {
    const abcdef = question.answers.abcdef
    options = JSON.stringify({
      A: abcdef.A || '',
      B: abcdef.B || '',
      C: abcdef.C || '',
      D: abcdef.D || '',
      E: abcdef.E || '',
      F: abcdef.F || ''
    })
    correctAnswer = abcdef.correct
  } else if (question.type === 'bonus' && question.answers.bonus) {
    options = JSON.stringify(question.answers.bonus)
    correctAnswer = question.answers.bonus.join(', ')
  }
  
  db.prepare(`
    INSERT INTO questions (id, text, type, correct_answer, options, media_url, points, category, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    question.id,
    question.text,
    question.type,
    correctAnswer,
    options,
    question.media?.imageUrl || null,
    1,
    'cat1', // default category
    question.difficulty
  )
}

// Seed quizzes
console.log('Seeding quizzes...')
for (const quiz of demoQuizzes) {
  // Transformace sekvencí
  const sequence = quiz.rounds.map(round => ({
    round: round.number,
    title: round.title,
    questions: round.questions
  }))
  
  db.prepare(`
    INSERT INTO quizzes (id, name, description, template_id, sequence, status, author)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    quiz.id,
    quiz.title,
    quiz.description,
    quiz.templateId,
    JSON.stringify(sequence),
    quiz.status,
    'admin'
  )
  
  // Seed quiz_questions
  let orderIndex = 0
  for (const round of quiz.rounds) {
    for (const questionId of round.questions) {
      db.prepare(`
        INSERT OR REPLACE INTO quiz_questions (quiz_id, question_id, order_index, round_number)
        VALUES (?, ?, ?, ?)
      `).run(quiz.id, questionId, orderIndex, round.number)
      orderIndex++
    }
  }
}

console.log('Seeding completed successfully!')
console.log(`- ${demoTemplates.length} templates`)
console.log(`- ${categories.length} categories`)
console.log(`- ${demoQuestions.length} questions`)
console.log(`- ${demoQuizzes.length} quizzes`)