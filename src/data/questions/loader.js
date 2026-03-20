import specimenQuestions from './specimen.json'
import ch01Questions from './ch01.json'
import ch02Questions from './ch02.json'
import ch03Questions from './ch03.json'
import ch04Questions from './ch04.json'
import ch05Questions from './ch05.json'
import ch06Questions from './ch06.json'
import ch07Questions from './ch07.json'
import ch08Questions from './ch08.json'
import ch09Questions from './ch09.json'
import ch10Questions from './ch10.json'
import ch11Questions from './ch11.json'

const additionalQuestions = [
  ...ch01Questions,
  ...ch02Questions,
  ...ch03Questions,
  ...ch04Questions,
  ...ch05Questions,
  ...ch06Questions,
  ...ch07Questions,
  ...ch08Questions,
  ...ch09Questions,
  ...ch10Questions,
  ...ch11Questions,
]

export async function loadAllQuestions() {
  const all = [...specimenQuestions, ...additionalQuestions]
  if (import.meta.env.DEV) {
    const { validateAllQuestions } = await import('./schema.js')
    const { valid, errors, stats } = validateAllQuestions(all)
    if (!valid) {
      console.error(`[RiskReady] ${errors.length} question validation errors:`, errors)
    } else {
      console.debug(`[RiskReady] All ${stats.total} questions valid`)
    }
  }
  return all
}

export function getQuestionDifficultyMap(questions) {
  const map = {}
  for (const q of questions) {
    map[q.id] = q.difficulty
  }
  return map
}

export function getQuestionsByChapter(questions, chapterId) {
  return questions.filter((q) => q.chapter === chapterId)
}

export function getQuestionById(questions, id) {
  return questions.find((q) => q.id === id)
}
