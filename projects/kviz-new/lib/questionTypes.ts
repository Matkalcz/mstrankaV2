// lib/questionTypes.ts — jediný zdroj pravdy pro popisky typů otázek
// Importujte odsud, nikdy neignorujte duplicitní definice v jednotlivých souborech

export type QuestionType = 'simple' | 'abcdef' | 'bonus' | 'audio' | 'video' | 'image'
export type Difficulty    = 'easy' | 'medium' | 'hard'

/** Krátký popisek — pro štítky, filtry, rozbalovací seznamy */
export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  simple: 'Prostá',
  abcdef: 'ABCDEF',
  bonus:  'Bonusová',
  audio:  'Audio',
  video:  'Video',
  image:  'Obrázková',
}

/** Plný popisek — pro nadpisy formulářů apod. */
export const QUESTION_TYPE_LABEL_FULL: Record<QuestionType, string> = {
  simple: 'Prostá otázka',
  abcdef: 'ABCDEF otázka',
  bonus:  'Bonusová otázka',
  audio:  'Audio otázka',
  video:  'Video otázka',
  image:  'Obrázková otázka',
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy:   'Lehká',
  medium: 'Střední',
  hard:   'Těžká',
}

export const QUESTION_TYPES = Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]
export const DIFFICULTIES    = Object.keys(DIFFICULTY_LABEL)    as Difficulty[]
