import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useOrgStore } from '@/store/useOrgStore'
import { cn, formatDate } from '@/lib/utils'
import { IconArrowLeft } from '@/components/Icons'
import chapters from '@/data/chapters.json'

export default function MemberDetail() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const { org } = useAuthStore()
  const { members, loadMemberDetail } = useOrgStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const member = members.find((m) => m.id === memberId)

  useEffect(() => {
    if (!org || org.role !== 'admin') {
      navigate('/org')
      return
    }
    async function load() {
      setLoading(true)
      const result = await loadMemberDetail(memberId)
      setData(result)
      setLoading(false)
    }
    load()
  }, [memberId, org])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
      </div>
    )
  }

  if (!data) return null

  const { attempts, score } = data
  const chapterList = chapters.map((ch) => {
    const chData = score.byChapter[ch.id]
    return chData ? { id: ch.id, name: `Ch ${ch.number}: ${ch.title}`, ...chData } : null
  }).filter(Boolean)

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/org')}
        className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
      >
        <IconArrowLeft className="w-4 h-4" />
        Back to Organisation
      </button>

      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-semibold text-primary-700 dark:text-primary-400">
            {(member?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">
              {member?.displayName || 'Member'}
            </h1>
            <p className="text-sm text-surface-400">
              {member?.role} · Joined {member?.createdAt ? formatDate(member.createdAt) : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-primary-500 shadow-sm p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Mock Exams</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{attempts.length}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-accent-400 shadow-sm p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Questions</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{score.total}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-success-500 shadow-sm p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Accuracy</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{score.percentage}%</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-primary-600 shadow-sm p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Streak</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{member?.currentStreak || 0} <span className="text-sm font-normal text-surface-400">days</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam history */}
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800">
            <h3 className="font-semibold text-surface-800 dark:text-surface-100">Mock Exam History</h3>
          </div>
          {attempts.length === 0 ? (
            <p className="text-sm text-surface-400 py-8 text-center">No exams taken yet.</p>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {[...attempts].reverse().map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm text-surface-700 dark:text-surface-300">{formatDate(a.completedAt)}</p>
                    <p className="text-xs text-surface-400 tabular-nums">{a.correctCount}/{a.totalQuestions} correct</p>
                  </div>
                  <span className={cn(
                    'text-lg font-bold tabular-nums',
                    a.score >= 65 ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
                  )}>{a.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chapter accuracy */}
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800">
            <h3 className="font-semibold text-surface-800 dark:text-surface-100">Chapter Accuracy</h3>
          </div>
          {chapterList.length === 0 ? (
            <p className="text-sm text-surface-400 py-8 text-center">No data yet.</p>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {chapterList.map((ch) => (
                <div key={ch.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 dark:text-surface-300 truncate">{ch.name}</p>
                    <div className="mt-1 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          ch.percentage >= 65 ? 'bg-success-500' : ch.percentage >= 50 ? 'bg-accent-400' : 'bg-danger-500'
                        )}
                        style={{ width: `${ch.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm font-bold tabular-nums w-12 text-right',
                    ch.percentage >= 65 ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
                  )}>
                    {ch.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
