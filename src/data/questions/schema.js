import chapters from '@/data/chapters.json'
import scenarios from '@/data/scenarios/index.json'

const VALID_CHAPTER_IDS = new Set(chapters.map((c) => c.id))
const VALID_SCENARIO_IDS = new Set(scenarios.map((s) => s.id))
const VALID_TYPES = new Set(['single'])
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const LO_PATTERN = /^\d+\.\d+$/

export function validateQuestion(q, seenIds) {
  const errors = []
  const id = q?.id ?? '(missing)'

  if (!q || typeof q !== 'object') {
    return { valid: false, errors: [{ questionId: id, field: 'root', message: 'Not an object' }] }
  }

  // id
  if (typeof q.id !== 'string' || !q.id.trim()) {
    errors.push({ questionId: id, field: 'id', message: 'Must be a non-empty string' })
  } else if (seenIds.has(q.id)) {
    errors.push({ questionId: id, field: 'id', message: `Duplicate ID: ${q.id}` })
  }

  // chapter
  if (!VALID_CHAPTER_IDS.has(q.chapter)) {
    errors.push({ questionId: id, field: 'chapter', message: `Invalid chapter: ${q.chapter}` })
  }

  // learningOutcome
  if (typeof q.learningOutcome !== 'string' || !LO_PATTERN.test(q.learningOutcome)) {
    errors.push({ questionId: id, field: 'learningOutcome', message: `Must match N.N pattern: ${q.learningOutcome}` })
  }

  // type
  if (!VALID_TYPES.has(q.type)) {
    errors.push({ questionId: id, field: 'type', message: `Invalid type: ${q.type}` })
  }

  // stem
  if (typeof q.stem !== 'string' || q.stem.length < 10) {
    errors.push({ questionId: id, field: 'stem', message: 'Must be a string with at least 10 characters' })
  }

  // options
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push({ questionId: id, field: 'options', message: 'Must be an array of exactly 4 items' })
  } else {
    q.options.forEach((opt, i) => {
      if (typeof opt !== 'string' || !opt.trim()) {
        errors.push({ questionId: id, field: `options[${i}]`, message: 'Must be a non-empty string' })
      }
    })
  }

  // answer
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
    errors.push({ questionId: id, field: 'answer', message: `Must be integer 0-3: ${q.answer}` })
  }

  // explanation
  if (typeof q.explanation !== 'string' || q.explanation.length < 5) {
    errors.push({ questionId: id, field: 'explanation', message: 'Must be a string with at least 5 characters' })
  }

  // scenarioId
  if (q.scenarioId !== null && q.scenarioId !== undefined) {
    if (typeof q.scenarioId !== 'string' || !VALID_SCENARIO_IDS.has(q.scenarioId)) {
      errors.push({ questionId: id, field: 'scenarioId', message: `Invalid scenarioId: ${q.scenarioId}` })
    }
  }

  // difficulty
  if (!VALID_DIFFICULTIES.has(q.difficulty)) {
    errors.push({ questionId: id, field: 'difficulty', message: `Invalid difficulty: ${q.difficulty}` })
  }

  return { valid: errors.length === 0, errors }
}

export function validateAllQuestions(questions) {
  const seenIds = new Set()
  const allErrors = []
  const stats = { total: 0, byChapter: {}, byDifficulty: {} }

  for (const q of questions) {
    const { errors } = validateQuestion(q, seenIds)
    if (q?.id) seenIds.add(q.id)
    allErrors.push(...errors)

    stats.total++
    if (q?.chapter) {
      stats.byChapter[q.chapter] = (stats.byChapter[q.chapter] || 0) + 1
    }
    if (q?.difficulty) {
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors, stats }
}
