const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/kviz.db');
const outputPath = path.join(__dirname, '../public/data/questions.json');

const db = new Database(dbPath);
const questions = db.prepare('SELECT * FROM questions').all();

const transformed = questions.map(q => ({
  id: q.id,
  text: q.text,
  type: q.type,
  category: q.category || 'Uncategorized',
  difficulty: q.difficulty || 'medium',
  createdAt: q.created_at || new Date().toISOString(),
  usedIn: 0
}));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
console.log(`Generated ${transformed.length} questions to ${outputPath}`);
