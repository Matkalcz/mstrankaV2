import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(process.cwd(), 'data', 'kviz.db')

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true })
}

const db = new Database(dbPath)

// ---------------------------------------------------------------------------
// Schema init — creates tables that don't exist yet (fresh DB)
// ---------------------------------------------------------------------------
export function initDatabase() {
  // Templates
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      background_color TEXT,
      text_color TEXT,
      accent_color TEXT,
      font_family TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tags (replaces old 'categories' table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#3b82f6',
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Questions — no 'category' column (multi-tag via junction)
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('simple', 'abcdef', 'bonus', 'audio', 'video', 'image')),
      correct_answer TEXT,
      options TEXT,
      media_url TEXT,
      points INTEGER DEFAULT 1,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Question ↔ Tag junction
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_tags (
      question_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (question_id, tag_id),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `)

  // Quizzes
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      template_id TEXT REFERENCES templates(id),
      sequence TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      author TEXT
    )
  `)

  // Quiz ↔ Question junction
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
      question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
      order_index INTEGER,
      round_number INTEGER DEFAULT 1,
      PRIMARY KEY (quiz_id, question_id)
    )
  `)

  // Exports
  db.exec(`
    CREATE TABLE IF NOT EXISTS exports (
      id TEXT PRIMARY KEY,
      quiz_id TEXT REFERENCES quizzes(id),
      format TEXT CHECK(format IN ('pptx', 'pdf')),
      file_path TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed'))
    )
  `)

  console.log('Database initialized')
}

// ---------------------------------------------------------------------------
// Migration 1: fix questions CHECK constraint — remove 'ab', add 'image'
// ---------------------------------------------------------------------------
function migrateQuestionsSchema() {
  const info = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='questions'"
  ).get() as { sql: string } | undefined

  if (info?.sql?.includes("'image'")) return // already done

  const run = db.transaction(() => {
    db.exec(`
      CREATE TABLE questions_v2 (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('simple', 'abcdef', 'bonus', 'audio', 'video', 'image')),
        correct_answer TEXT,
        options TEXT,
        media_url TEXT,
        points INTEGER DEFAULT 1,
        category TEXT,
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    db.exec(`
      INSERT INTO questions_v2
        SELECT id, text,
          CASE WHEN type = 'ab' THEN 'abcdef' ELSE type END,
          correct_answer, options, media_url, points, category, difficulty,
          created_at, updated_at
        FROM questions
    `)
    db.exec('DROP TABLE questions')
    db.exec('ALTER TABLE questions_v2 RENAME TO questions')
  })
  run()
  console.log('Migration 1: questions type constraint updated (ab→abcdef, image added)')
}

// ---------------------------------------------------------------------------
// Migration 2: categories → tags + question_tags junction
// ---------------------------------------------------------------------------
function migrateToTagsSystem() {
  const categoriesExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='categories'"
  ).get()

  if (!categoriesExists) return // fresh DB or already migrated

  const run = db.transaction(() => {
    // 1. Create tags table if it doesn't exist yet, then copy from categories
    const tagsExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='tags'"
    ).get()

    if (!tagsExists) {
      db.exec(`
        CREATE TABLE tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT DEFAULT '#3b82f6',
          icon TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    // Copy categories → tags (skip duplicates)
    db.exec(`INSERT OR IGNORE INTO tags SELECT * FROM categories`)

    // 2. Ensure question_tags junction exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS question_tags (
        question_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (question_id, tag_id),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `)

    // 3. Migrate questions.category → question_tags
    const qInfo = db.prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='questions'"
    ).get() as { sql: string } | undefined

    if (qInfo?.sql?.includes('category')) {
      // Populate junction from single-category column
      db.exec(`
        INSERT OR IGNORE INTO question_tags (question_id, tag_id)
        SELECT id, category FROM questions
        WHERE category IS NOT NULL AND category != '' AND category != 'null'
      `)

      // Recreate questions without 'category' column
      db.exec(`
        CREATE TABLE questions_no_cat (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('simple', 'abcdef', 'bonus', 'audio', 'video', 'image')),
          correct_answer TEXT,
          options TEXT,
          media_url TEXT,
          points INTEGER DEFAULT 1,
          difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      db.exec(`
        INSERT INTO questions_no_cat
          SELECT id, text, type, correct_answer, options, media_url, points, difficulty, created_at, updated_at
          FROM questions
      `)
      db.exec('DROP TABLE questions')
      db.exec('ALTER TABLE questions_no_cat RENAME TO questions')
    }

    // 4. Drop old categories table
    db.exec('DROP TABLE categories')
  })

  run()
  console.log('Migration 2: categories→tags, question_tags junction created')
}

// ---------------------------------------------------------------------------
// Tag operations
// ---------------------------------------------------------------------------
export const tags = {
  getAll: () => db.prepare('SELECT * FROM tags ORDER BY name').all(),
  getById: (id: string) => db.prepare('SELECT * FROM tags WHERE id = ?').get(id),
  getByName: (name: string) => db.prepare('SELECT * FROM tags WHERE name = ?').get(name),

  create: (data: any) => {
    const id = crypto.randomUUID()
    db.prepare(`
      INSERT INTO tags (id, name, description, color, icon)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, data.name, data.description || '', data.color || '#3b82f6', data.icon || '')
    return id
  },

  update: (id: string, data: any) => {
    db.prepare(`
      UPDATE tags
      SET name = ?, description = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(data.name, data.description || '', data.color || '#3b82f6', data.icon || '', id)
  },

  delete: (id: string) => {
    const used = db.prepare(
      'SELECT COUNT(*) as count FROM question_tags WHERE tag_id = ?'
    ).get(id) as { count: number }
    if (used.count > 0) {
      throw new Error(`Tag je přiřazen k ${used.count} otázkám a nelze jej smazat`)
    }
    db.prepare('DELETE FROM tags WHERE id = ?').run(id)
  },
}

// Backward-compat alias — existing /api/categories routes continue to work
export const categories = tags

// ---------------------------------------------------------------------------
// Question helpers — parse tag columns from GROUP_CONCAT
// ---------------------------------------------------------------------------
function parseTagCols(row: any) {
  if (!row) return null
  const tag_ids: string[] = row.tag_ids_csv ? row.tag_ids_csv.split(',') : []
  const tag_names: string[] = row.tag_names_csv ? row.tag_names_csv.split('|||') : []
  const tagsArr = tag_ids.map((id, i) => ({ id, name: tag_names[i] || '' }))
  // Remove raw csv cols from returned object
  const { tag_ids_csv, tag_names_csv, ...rest } = row
  return { ...rest, tag_ids, tag_names, tags: tagsArr }
}

const QUESTIONS_SELECT = `
  SELECT q.*,
    GROUP_CONCAT(t.id, ',')   AS tag_ids_csv,
    GROUP_CONCAT(t.name, '|||') AS tag_names_csv
  FROM questions q
  LEFT JOIN question_tags qt ON q.id = qt.question_id
  LEFT JOIN tags t ON qt.tag_id = t.id
`

// ---------------------------------------------------------------------------
// Question operations
// ---------------------------------------------------------------------------
export const questions = {
  getAll: () => {
    const rows = db.prepare(
      QUESTIONS_SELECT + ' GROUP BY q.id ORDER BY q.created_at DESC'
    ).all()
    return rows.map(parseTagCols)
  },

  getById: (id: string) => {
    const row = db.prepare(
      QUESTIONS_SELECT + ' WHERE q.id = ? GROUP BY q.id'
    ).get(id)
    return parseTagCols(row)
  },

  getByType: (type: string) => {
    const rows = db.prepare(
      QUESTIONS_SELECT + ' WHERE q.type = ? GROUP BY q.id ORDER BY q.created_at DESC'
    ).all(type)
    return rows.map(parseTagCols)
  },

  create: (data: any) => {
    const id = crypto.randomUUID()
    const run = db.transaction(() => {
      db.prepare(`
        INSERT INTO questions (id, text, type, correct_answer, options, media_url, points, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.text,
        data.type,
        data.correct_answer ?? null,
        JSON.stringify(data.options || []),
        data.media_url ?? null,
        data.points || 1,
        data.difficulty || 'medium'
      )

      const tagIds: string[] = Array.isArray(data.tag_ids) ? data.tag_ids : []
      for (const tagId of tagIds) {
        db.prepare('INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)').run(id, tagId)
      }
    })
    run()
    return id
  },

  update: (id: string, data: any) => {
    const run = db.transaction(() => {
      db.prepare(`
        UPDATE questions
        SET text = ?, type = ?, correct_answer = ?, options = ?, media_url = ?, points = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        data.text,
        data.type,
        data.correct_answer ?? null,
        JSON.stringify(data.options || []),
        data.media_url ?? null,
        data.points || 1,
        data.difficulty || 'medium',
        id
      )

      if (Array.isArray(data.tag_ids)) {
        db.prepare('DELETE FROM question_tags WHERE question_id = ?').run(id)
        for (const tagId of data.tag_ids) {
          db.prepare('INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)').run(id, tagId)
        }
      }
    })
    run()
  },

  delete: (id: string) => {
    db.prepare('DELETE FROM questions WHERE id = ?').run(id)
  },
}

// ---------------------------------------------------------------------------
// Quiz operations
// ---------------------------------------------------------------------------
export const quizzes = {
  getAll: () => db.prepare('SELECT * FROM quizzes ORDER BY created_at DESC').all(),
  getById: (id: string) => db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id),

  create: (data: any) => {
    const id = crypto.randomUUID()
    db.prepare(`
      INSERT INTO quizzes (id, name, description, template_id, sequence, status, author)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.description,
      data.template_id,
      JSON.stringify(data.sequence || []),
      data.status || 'draft',
      data.author || 'admin'
    )
    return id
  },

  update: (id: string, data: any) => {
    db.prepare(`
      UPDATE quizzes
      SET name = ?, description = ?, template_id = ?, sequence = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name,
      data.description,
      data.template_id,
      JSON.stringify(data.sequence || []),
      data.status || 'draft',
      id
    )
  },

  delete: (id: string) => db.prepare('DELETE FROM quizzes WHERE id = ?').run(id),

  addQuestion: (quizId: string, questionId: string, orderIndex: number, roundNumber = 1) => {
    db.prepare(`
      INSERT OR REPLACE INTO quiz_questions (quiz_id, question_id, order_index, round_number)
      VALUES (?, ?, ?, ?)
    `).run(quizId, questionId, orderIndex, roundNumber)
  },

  removeQuestion: (quizId: string, questionId: string) => {
    db.prepare('DELETE FROM quiz_questions WHERE quiz_id = ? AND question_id = ?').run(quizId, questionId)
  },

  getQuestions: (quizId: string) => {
    return db.prepare(`
      SELECT q.*, qq.order_index, qq.round_number
      FROM questions q
      JOIN quiz_questions qq ON q.id = qq.question_id
      WHERE qq.quiz_id = ?
      ORDER BY qq.order_index
    `).all(quizId)
  },
}

// ---------------------------------------------------------------------------
// Template operations
// ---------------------------------------------------------------------------
export const templates = {
  getAll: () => db.prepare('SELECT * FROM templates ORDER BY name').all(),
  getById: (id: string) => db.prepare('SELECT * FROM templates WHERE id = ?').get(id),

  create: (data: any) => {
    const id = crypto.randomUUID()
    const config = data.config ? JSON.stringify(data.config) : null
    db.prepare(`
      INSERT INTO templates (id, name, background_color, text_color, accent_color, font_family, config)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.config?.backgroundColor ?? data.background_color ?? '#1a1c2e',
      data.config?.textColor ?? data.text_color ?? '#ffffff',
      data.config?.accentColor ?? data.accent_color ?? '#7c3aed',
      data.config?.fontFamily ?? data.font_family ?? 'Plus Jakarta Sans',
      config,
    )
    return id
  },

  update: (id: string, data: any) => {
    const config = data.config ? JSON.stringify(data.config) : null
    db.prepare(`
      UPDATE templates
      SET name = ?, background_color = ?, text_color = ?, accent_color = ?, font_family = ?, config = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name,
      data.config?.backgroundColor ?? data.background_color ?? '#1a1c2e',
      data.config?.textColor ?? data.text_color ?? '#ffffff',
      data.config?.accentColor ?? data.accent_color ?? '#7c3aed',
      data.config?.fontFamily ?? data.font_family ?? 'Plus Jakarta Sans',
      config,
      id,
    )
  },

  delete: (id: string) => db.prepare('DELETE FROM templates WHERE id = ?').run(id),
}

// ---------------------------------------------------------------------------
// Export operations
// ---------------------------------------------------------------------------
export const exports = {
  create: (quizId: string, format: string) => {
    const id = crypto.randomUUID()
    db.prepare(`INSERT INTO exports (id, quiz_id, format, status) VALUES (?, ?, ?, 'pending')`).run(id, quizId, format)
    return id
  },
  updateStatus: (id: string, status: string, filePath?: string) => {
    db.prepare(`UPDATE exports SET status = ?, file_path = ?, generated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, filePath, id)
  },
  getByQuiz: (quizId: string) => db.prepare('SELECT * FROM exports WHERE quiz_id = ? ORDER BY generated_at DESC').all(quizId),
}

// ---------------------------------------------------------------------------
// Migration 3: add config JSON column to templates
// ---------------------------------------------------------------------------
function migrateTemplatesConfig() {
  const info = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='templates'"
  ).get() as { sql: string } | undefined
  if (!info || info.sql.includes('config')) return
  db.exec('ALTER TABLE templates ADD COLUMN config TEXT')
  console.log('Migration 3: templates.config column added')
}

// ---------------------------------------------------------------------------
// Boot — init + migrate
// ---------------------------------------------------------------------------
initDatabase()
migrateQuestionsSchema()
migrateToTagsSystem()
migrateTemplatesConfig()

export default db
