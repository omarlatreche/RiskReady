import chapters from '@/data/chapters.json'
import { shuffleArray } from './utils'

export function calculateScore(responses) {
  if (!responses.length) return { correct: 0, total: 0, percentage: 0, byChapter: {} }

  const correct = responses.filter((r) => r.correct).length
  const total = responses.length
  const percentage = Math.round((correct / total) * 100)

  const byChapter = {}
  for (const r of responses) {
    if (!byChapter[r.chapter]) {
      byChapter[r.chapter] = { correct: 0, total: 0 }
    }
    byChapter[r.chapter].total += 1
    if (r.correct) byChapter[r.chapter].correct += 1
  }

  for (const ch of Object.keys(byChapter)) {
    byChapter[ch].percentage = Math.round(
      (byChapter[ch].correct / byChapter[ch].total) * 100
    )
  }

  return { correct, total, percentage, byChapter }
}

export function analyzeConfidence(responses) {
  const matrix = {
    highConfCorrect: 0,
    highConfWrong: 0,
    medConfCorrect: 0,
    medConfWrong: 0,
    lowConfCorrect: 0,
    lowConfWrong: 0,
  }

  for (const r of responses) {
    const conf = r.confidence || 2
    if (conf === 3) {
      matrix[r.correct ? 'highConfCorrect' : 'highConfWrong'] += 1
    } else if (conf === 2) {
      matrix[r.correct ? 'medConfCorrect' : 'medConfWrong'] += 1
    } else {
      matrix[r.correct ? 'lowConfCorrect' : 'lowConfWrong'] += 1
    }
  }

  return matrix
}

export function detectOverconfidence(responses) {
  const highConfResponses = responses.filter((r) => r.confidence === 3)
  if (highConfResponses.length < 3) return []

  const byChapter = {}
  for (const r of highConfResponses) {
    if (!byChapter[r.chapter]) byChapter[r.chapter] = { correct: 0, wrong: 0 }
    byChapter[r.chapter][r.correct ? 'correct' : 'wrong'] += 1
  }

  return Object.entries(byChapter)
    .filter(([, data]) => data.wrong > data.correct)
    .map(([chapter]) => chapter)
}

export function getWeakChapters(responses, threshold = 65) {
  const { byChapter } = calculateScore(responses)
  return Object.entries(byChapter)
    .filter(([, data]) => data.percentage < threshold)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .map(([chapter, data]) => ({ chapter, ...data }))
}

export function generateMockExam(allQuestions, scenarios = []) {
  const mockQuestions = []
  const usedIds = new Set()

  // Only use single-choice questions for mock exams (matches real CII format)
  const singleQuestions = allQuestions.filter((q) => q.type === 'single')

  // Separate scenario and non-scenario questions
  const scenarioQuestions = singleQuestions.filter((q) => q.scenarioId)
  const nonScenarioQuestions = singleQuestions.filter((q) => !q.scenarioId)

  // Step 1: Select scenario-based questions (target: 10, ~20%)
  const scenarioGroups = {}
  for (const q of scenarioQuestions) {
    if (!scenarioGroups[q.scenarioId]) scenarioGroups[q.scenarioId] = []
    scenarioGroups[q.scenarioId].push(q)
  }

  const shuffledGroups = shuffleArray(Object.entries(scenarioGroups))
  let scenarioCount = 0
  for (const [, questions] of shuffledGroups) {
    if (scenarioCount + questions.length > 10) continue
    for (const q of questions) {
      mockQuestions.push(q)
      usedIds.add(q.id)
      scenarioCount += 1
    }
    if (scenarioCount >= 10) break
  }

  // Step 2: Fill remaining slots per chapter weights
  const remaining = 50 - mockQuestions.length
  const chapterPool = {}
  for (const q of nonScenarioQuestions) {
    if (usedIds.has(q.id)) continue
    if (!chapterPool[q.chapter]) chapterPool[q.chapter] = []
    chapterPool[q.chapter].push(q)
  }

  // Calculate adjusted weights (subtract scenario questions already selected per chapter)
  const selectedPerChapter = {}
  for (const q of mockQuestions) {
    selectedPerChapter[q.chapter] = (selectedPerChapter[q.chapter] || 0) + 1
  }

  let totalNeeded = remaining
  const chapterTargets = {}

  for (const ch of chapters) {
    const already = selectedPerChapter[ch.id] || 0
    const target = Math.max(0, ch.mockWeight - already)
    chapterTargets[ch.id] = target
  }

  // Normalize targets to fill exactly `remaining` slots
  const targetSum = Object.values(chapterTargets).reduce((a, b) => a + b, 0)
  if (targetSum > 0 && targetSum !== totalNeeded) {
    const scale = totalNeeded / targetSum
    let assigned = 0
    const entries = Object.entries(chapterTargets)
    for (let i = 0; i < entries.length - 1; i++) {
      const scaled = Math.round(entries[i][1] * scale)
      chapterTargets[entries[i][0]] = scaled
      assigned += scaled
    }
    chapterTargets[entries[entries.length - 1][0]] = totalNeeded - assigned
  }

  // Select questions per chapter
  for (const [chId, target] of Object.entries(chapterTargets)) {
    const pool = shuffleArray(chapterPool[chId] || [])
    const toAdd = pool.slice(0, target)
    for (const q of toAdd) {
      mockQuestions.push(q)
      usedIds.add(q.id)
    }
  }

  // Step 3: If still under 50, fill from any remaining questions
  if (mockQuestions.length < 50) {
    const remaining = singleQuestions.filter((q) => !usedIds.has(q.id))
    const shuffled = shuffleArray(remaining)
    for (const q of shuffled) {
      if (mockQuestions.length >= 50) break
      mockQuestions.push(q)
    }
  }

  // Step 4: Shuffle, keeping scenario groups together
  const scenarioGrouped = []
  const standalone = []
  const seenScenarios = new Set()

  for (const q of mockQuestions) {
    if (q.scenarioId && !seenScenarios.has(q.scenarioId)) {
      seenScenarios.add(q.scenarioId)
      const group = mockQuestions.filter((mq) => mq.scenarioId === q.scenarioId)
      scenarioGrouped.push(group)
    } else if (!q.scenarioId) {
      standalone.push(q)
    }
  }

  const shuffledStandalone = shuffleArray(standalone)
  const shuffledScenarioGroups = shuffleArray(scenarioGrouped)

  // Interleave: place scenario groups at roughly even intervals
  const result = [...shuffledStandalone]
  const interval = Math.floor(result.length / (shuffledScenarioGroups.length + 1))

  for (let i = 0; i < shuffledScenarioGroups.length; i++) {
    const insertAt = Math.min((i + 1) * interval, result.length)
    result.splice(insertAt, 0, ...shuffledScenarioGroups[i])
  }

  return result.slice(0, 50)
}

export function getAdaptiveQuestions(allQuestions, responses, count = 20) {
  const chapterAccuracy = {}
  for (const r of responses) {
    if (!chapterAccuracy[r.chapter]) chapterAccuracy[r.chapter] = { correct: 0, total: 0 }
    chapterAccuracy[r.chapter].total += 1
    if (r.correct) chapterAccuracy[r.chapter].correct += 1
  }

  // Weight chapters inversely to accuracy
  const weights = {}
  for (const ch of chapters) {
    const acc = chapterAccuracy[ch.id]
    if (!acc || acc.total === 0) {
      weights[ch.id] = 1.5 // Unseen chapters get high weight
    } else {
      const accuracy = acc.correct / acc.total
      weights[ch.id] = Math.max(0.2, 1 - accuracy)
    }
  }

  // Prioritize previously wrong questions
  const wrongIds = new Set(
    responses.filter((r) => !r.correct).map((r) => r.questionId)
  )

  const scored = allQuestions.map((q) => ({
    question: q,
    score: (weights[q.chapter] || 1) * (wrongIds.has(q.id) ? 2 : 1) + Math.random() * 0.3,
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, count).map((s) => s.question)
}
