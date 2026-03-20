import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../src/data')

// Load reference data
const chapters = JSON.parse(readFileSync(resolve(dataDir, 'chapters.json'), 'utf-8'))
const scenarios = JSON.parse(readFileSync(resolve(dataDir, 'scenarios/index.json'), 'utf-8'))

const VALID_CHAPTER_IDS = new Set(chapters.map((c) => c.id))
const VALID_SCENARIO_IDS = new Set(scenarios.map((s) => s.id))
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const LO_PATTERN = /^\d+\.\d+$/

// Load all question files
const questionFiles = [
  'questions/specimen.json',
  'questions/ch01.json', 'questions/ch02.json', 'questions/ch03.json',
  'questions/ch04.json', 'questions/ch05.json', 'questions/ch06.json',
  'questions/ch07.json', 'questions/ch08.json', 'questions/ch09.json',
  'questions/ch10.json', 'questions/ch11.json',
]

const allQuestions = []
for (const file of questionFiles) {
  const data = JSON.parse(readFileSync(resolve(dataDir, file), 'utf-8'))
  allQuestions.push(...data)
}

// Validate
const seenIds = new Set()
const errors = []
const stats = { total: 0, byChapter: {}, byDifficulty: {} }

for (const q of allQuestions) {
  const id = q?.id ?? '(missing)'

  if (!q || typeof q !== 'object') {
    errors.push(`${id}: Not an object`)
    continue
  }

  if (typeof q.id !== 'string' || !q.id.trim()) {
    errors.push(`${id}: id must be a non-empty string`)
  } else if (seenIds.has(q.id)) {
    errors.push(`${id}: Duplicate ID`)
  } else {
    seenIds.add(q.id)
  }

  if (!VALID_CHAPTER_IDS.has(q.chapter)) errors.push(`${id}: invalid chapter "${q.chapter}"`)
  if (typeof q.learningOutcome !== 'string' || !LO_PATTERN.test(q.learningOutcome)) errors.push(`${id}: learningOutcome must match N.N`)
  if (q.type !== 'single') errors.push(`${id}: type must be "single"`)
  if (typeof q.stem !== 'string' || q.stem.length < 10) errors.push(`${id}: stem too short`)
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${id}: options must be array of 4`)
  else q.options.forEach((opt, i) => { if (typeof opt !== 'string' || !opt.trim()) errors.push(`${id}: options[${i}] empty`) })
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`${id}: answer must be 0-3`)
  if (typeof q.explanation !== 'string' || q.explanation.length < 5) errors.push(`${id}: explanation too short`)
  if (q.scenarioId !== null && q.scenarioId !== undefined && !VALID_SCENARIO_IDS.has(q.scenarioId)) errors.push(`${id}: invalid scenarioId`)
  if (!VALID_DIFFICULTIES.has(q.difficulty)) errors.push(`${id}: invalid difficulty "${q.difficulty}"`)

  stats.total++
  stats.byChapter[q.chapter] = (stats.byChapter[q.chapter] || 0) + 1
  stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1
}

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} validation error(s):\n`)
  errors.forEach((e) => console.error(`  • ${e}`))
  console.error()
  process.exit(1)
} else {
  console.log(`\n✅ All ${stats.total} questions valid\n`)
  console.log('By chapter:')
  for (const ch of chapters) {
    console.log(`  ${ch.id}: ${stats.byChapter[ch.id] || 0} questions`)
  }
  console.log('\nBy difficulty:')
  for (const [d, count] of Object.entries(stats.byDifficulty)) {
    console.log(`  ${d}: ${count}`)
  }
  console.log()
}
