// types/database.ts - Centrální typy pro databázi

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  created_at?: string
  updated_at?: string
}

export interface Question {
  id: string
  text: string
  type: 'simple' | 'ab' | 'abcdef' | 'bonus' | 'audio' | 'video'
  correct_answer?: string
  options?: string
  bonus_answers?: string
  media_url?: string
  media_type?: 'audio' | 'video'
  thumbnail_url?: string
  category?: string  // Starý formát
  category_id?: string // Nový formát
  difficulty?: 'easy' | 'medium' | 'hard'
  points?: number
  question_number?: number
  round_number?: number
  created_at?: string
  updated_at?: string
}

export interface Quiz {
  id: string
  name: string
  title: string
  description?: string
  author?: string
  status: 'draft' | 'published' | 'archived'
  sequence?: string | any[]
  created_at?: string
  updated_at?: string
}

export interface Template {
  id: string
  name: string
  background_color?: string
  text_color?: string
  accent_color?: string
  font_family?: string
  created_at?: string
  updated_at?: string
}