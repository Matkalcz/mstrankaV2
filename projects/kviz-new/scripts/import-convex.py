#!/usr/bin/env python3
import sqlite3
import json
import os
import sys

# Paths
convex_export_path = '/tmp/convex-export'
db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'kviz.db')

# Connect to SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Importing data from {convex_export_path} to {db_path}")

# Helper to read JSONL files
def read_jsonl(filepath):
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    return data

# Import categories
categories_file = os.path.join(convex_export_path, 'categories', 'documents.jsonl')
if os.path.exists(categories_file):
    print("Importing categories...")
    categories = read_jsonl(categories_file)
    for cat in categories:
        cursor.execute('''
            INSERT OR REPLACE INTO categories (id, name, description, color, icon)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            cat['_id'],
            cat.get('name', ''),
            '',  # description
            cat.get('color', '#3b82f6'),
            ''   # icon
        ))
    print(f"  Imported {len(categories)} categories")

# Import questions
questions_file = os.path.join(convex_export_path, 'questions', 'documents.jsonl')
if os.path.exists(questions_file):
    print("Importing questions...")
    questions = read_jsonl(questions_file)
    for q in questions:
        # Determine question type based on answerType
        answer_type = q.get('answerType', 'single')
        question_type = 'simple'
        correct_answer = ''
        options = None
        
        if answer_type == 'single':
            question_type = 'simple'
            correct_answer = q.get('singleAnswer', '')
        elif answer_type == 'multiple':
            question_type = 'abcdef'
            # Multiple choice questions have options in 'answers' field?
            # We'll need to examine data structure
            # For now, treat as simple
            correct_answer = q.get('singleAnswer', '')
        elif answer_type == 'ab':
            question_type = 'ab'
            correct_answer = q.get('singleAnswer', '')
        
        # Options (for ab/abcdef) - not present in current data
        # We'll leave as NULL
        
        # Category mapping
        category_id = q.get('categoryId')
        if not category_id:
            category_id = None
        
        # Difficulty (not in data) - default medium
        difficulty = 'medium'
        
        cursor.execute('''
            INSERT OR REPLACE INTO questions 
            (id, text, type, correct_answer, options, media_url, points, category, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            q['_id'],
            q.get('text', ''),
            question_type,
            correct_answer,
            options,
            None,  # media_url
            1,     # points
            category_id,
            difficulty
        ))
    print(f"  Imported {len(questions)} questions")

# Import quiz generations (as quizzes)
quiz_gen_file = os.path.join(convex_export_path, 'quizGenerations', 'documents.jsonl')
if os.path.exists(quiz_gen_file):
    print("Importing quiz generations...")
    quizzes = read_jsonl(quiz_gen_file)
    for quiz in quizzes:
        # Extract quiz name from manualSlides or use ID
        manual_slides = quiz.get('manualSlides', [])
        # Find intro slide with label
        name = f"Kvíz {quiz['_id'][:8]}"
        for slide in manual_slides:
            if slide.get('type') == 'INTRO' and slide.get('label'):
                name = slide['label']
                break
        
        # Description
        description = f"Importovaný kvíz z Convexu"
        
        # Sequence: we'll store slide structure as JSON
        sequence = json.dumps(manual_slides, ensure_ascii=False)
        
        # Status: assume published
        status = 'published'
        
        cursor.execute('''
            INSERT OR REPLACE INTO quizzes 
            (id, name, description, template_id, sequence, status, author)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            quiz['_id'],
            name,
            description,
            't1',  # default template
            sequence,
            status,
            'admin'
        ))
        
        # Import quiz questions from manualSlides
        order_index = 0
        for slide in manual_slides:
            if slide.get('type') in ('OTAZKA_AB', 'OTAZKA_SINGLE') and 'questionId' in slide:
                question_id = slide['questionId']
                # Check if question exists
                cursor.execute('SELECT id FROM questions WHERE id = ?', (question_id,))
                if cursor.fetchone():
                    cursor.execute('''
                        INSERT OR REPLACE INTO quiz_questions 
                        (quiz_id, question_id, order_index, round_number)
                        VALUES (?, ?, ?, ?)
                    ''', (quiz['_id'], question_id, order_index, 1))
                    order_index += 1
        
    print(f"  Imported {len(quizzes)} quiz generations")

# Import templates (if any)
templates_file = os.path.join(convex_export_path, 'templates', 'documents.jsonl')
if os.path.exists(templates_file):
    print("Importing templates...")
    templates = read_jsonl(templates_file)
    for t in templates:
        cursor.execute('''
            INSERT OR REPLACE INTO templates 
            (id, name, background_color, text_color, accent_color, font_family)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            t['_id'],
            t.get('name', 'Template'),
            t.get('backgroundColor', '#1e293b'),
            t.get('textColor', '#ffffff'),
            t.get('accentColor', '#3b82f6'),
            t.get('fontFamily', 'Inter, sans-serif')
        ))
    print(f"  Imported {len(templates)} templates")

# Commit and close
conn.commit()
conn.close()

print("Import completed successfully!")