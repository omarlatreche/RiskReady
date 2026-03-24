import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useOrgStore } from '@/store/useOrgStore'
import { api } from '@/lib/api'
import { cn, formatDate } from '@/lib/utils'
import { IconBuilding, IconUsers, IconUserPlus, IconTrash, IconMail } from '@/components/Icons'

function CreateOrgForm() {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const refreshOrg = useAuthStore((s) => s.refreshOrg)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError('')
    try {
      const result = await api.createOrg(name.trim())
      console.log('createOrg result:', result)
      await refreshOrg()
    } catch (err) {
      console.error('Failed to create org:', err.message || err)
      setError(err.message || 'Failed to create organisation')
    }
    setCreating(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">Organisation</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Create an organisation to manage your team.</p>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
          <IconBuilding className="w-7 h-7 text-surface-400 dark:text-surface-500" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-2">
          Create your organisation
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md mx-auto leading-relaxed mb-6">
          Set up an organisation to invite team members and track their exam progress.
        </p>
        <form onSubmit={handleCreate} className="flex items-center gap-3 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Organisation name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
        {error && <p className="text-sm text-danger-600 dark:text-danger-400 mt-3">{error}</p>}
      </div>
    </div>
  )
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'members', label: 'Members' },
]

function StatCard({ label, value, accent = 'border-l-primary-500' }) {
  return (
    <div className={cn('bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] shadow-sm shadow-surface-900/[0.03] p-4', accent)}>
      <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{value}</p>
    </div>
  )
}

function OverviewTab({ members, stats, navigate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Members" value={stats.totalMembers} accent="border-l-primary-500" />
        <StatCard label="Team Pass Rate" value={`${stats.teamPassRate}%`} accent="border-l-success-500" />
        <StatCard label="Avg Score" value={stats.teamAvgScore > 0 ? `${stats.teamAvgScore}%` : '-'} accent="border-l-accent-400" />
        <StatCard label="Active This Week" value={stats.activeThisWeek} accent="border-l-primary-600" />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <h3 className="font-semibold text-surface-800 dark:text-surface-100">Team Members</h3>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-surface-400 py-8 text-center">No members yet. Invite your team from the Members tab.</p>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(`/org/member/${m.id}`)}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-400 shrink-0">
                    {(m.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{m.displayName}</p>
                    <p className="text-xs text-surface-400">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-surface-500 dark:text-surface-400 text-xs">Exams</p>
                    <p className="font-medium tabular-nums text-surface-700 dark:text-surface-300">{m.examsTaken}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-surface-500 dark:text-surface-400 text-xs">Latest</p>
                    <p className={cn('font-bold tabular-nums', m.latestScore != null ? (m.latestScore >= 65 ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500') : 'text-surface-400')}>
                      {m.latestScore != null ? `${m.latestScore}%` : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-surface-500 dark:text-surface-400 text-xs">Last Active</p>
                    <p className="text-xs text-surface-600 dark:text-surface-400">
                      {m.lastActive ? formatDate(m.lastActive) : 'Never'}
                    </p>
                  </div>
                  <span className="text-surface-300 dark:text-surface-600 group-hover:text-surface-500 dark:group-hover:text-surface-400 transition-colors">&rarr;</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AnalyticsTab({ members, stats }) {
  // Score distribution bands
  const bands = [
    { label: '0-39%', min: 0, max: 39, color: 'bg-danger-500' },
    { label: '40-54%', min: 40, max: 54, color: 'bg-danger-400' },
    { label: '55-64%', min: 55, max: 64, color: 'bg-accent-400' },
    { label: '65-79%', min: 65, max: 79, color: 'bg-success-400' },
    { label: '80-100%', min: 80, max: 100, color: 'bg-success-600' },
  ]

  const membersWithScores = members.filter((m) => m.latestScore != null)
  const distribution = bands.map((band) => ({
    ...band,
    count: membersWithScores.filter((m) => m.latestScore >= band.min && m.latestScore <= band.max).length,
  }))
  const maxCount = Math.max(1, ...distribution.map((d) => d.count))

  // Weakest members (below pass mark)
  const struggling = members
    .filter((m) => m.avgScore != null && m.avgScore < 65)
    .sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Exams Taken" value={stats.totalExams} accent="border-l-primary-500" />
        <StatCard label="Team Avg Score" value={stats.teamAvgScore > 0 ? `${stats.teamAvgScore}%` : '-'} accent="border-l-accent-400" />
        <StatCard label="Team Pass Rate" value={`${stats.teamPassRate}%`} accent="border-l-success-500" />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm p-6">
        <h3 className="font-semibold text-surface-800 dark:text-surface-100 mb-4">Score Distribution (Latest Exam)</h3>
        {membersWithScores.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-4">No exam data yet.</p>
        ) : (
          <div className="space-y-3">
            {distribution.map((band) => (
              <div key={band.label} className="flex items-center gap-3">
                <span className="text-xs text-surface-500 dark:text-surface-400 w-16 text-right tabular-nums">{band.label}</span>
                <div className="flex-1 h-6 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', band.color)}
                    style={{ width: `${(band.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-surface-600 dark:text-surface-400 w-6 tabular-nums">{band.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {struggling.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm p-6">
          <h3 className="font-semibold text-surface-800 dark:text-surface-100 mb-4">Members Needing Support</h3>
          <div className="space-y-2">
            {struggling.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center text-xs font-semibold text-danger-700 dark:text-danger-400">
                    {(m.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-surface-700 dark:text-surface-300">{m.displayName}</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-danger-600 dark:text-danger-500">{m.avgScore}% avg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MembersTab({ members, invites, onInvite, onRevokeInvite, onRemoveMember }) {
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const currentUserId = useAuthStore((s) => s.user)

  async function handleInvite(e) {
    e.preventDefault()
    if (!email.trim()) return
    setInviting(true)
    setInviteError('')
    const ok = await onInvite(email.trim())
    if (!ok) setInviteError('Failed to send invite. The email may already be invited.')
    else setEmail('')
    setInviting(false)
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm p-6">
        <h3 className="font-semibold text-surface-800 dark:text-surface-100 mb-1">Invite Member</h3>
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">The invited person will be auto-assigned to your org when they sign up.</p>
        <form onSubmit={handleInvite} className="flex items-center gap-3">
          <div className="relative flex-1">
            <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={inviting || !email.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <IconUserPlus className="w-4 h-4" />
            {inviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>
        {inviteError && <p className="text-xs text-danger-600 mt-2">{inviteError}</p>}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800">
            <h3 className="font-semibold text-surface-800 dark:text-surface-100">Pending Invites</h3>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm text-surface-700 dark:text-surface-300">{inv.email}</p>
                  <p className="text-xs text-surface-400">{formatDate(inv.createdAt)}</p>
                </div>
                <button
                  onClick={() => onRevokeInvite(inv.id)}
                  className="text-xs text-danger-600 hover:text-danger-700 font-medium"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current members */}
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <h3 className="font-semibold text-surface-800 dark:text-surface-100">Current Members</h3>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-surface-400 py-8 text-center">No members yet.</p>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-400">
                    {(m.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{m.displayName}</p>
                    <p className="text-xs text-surface-400">{m.role} · Joined {formatDate(m.createdAt)}</p>
                  </div>
                </div>
                {m.role !== 'admin' && (
                  <button
                    onClick={() => onRemoveMember(m.id)}
                    title="Remove member"
                    className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-surface-400 hover:text-danger-600 transition-colors"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrgDashboard() {
  const navigate = useNavigate()
  const { org, isGuest, loading: authLoading } = useAuthStore()
  const { members, invites, stats, loading, loadDashboard, inviteMember, revokeInvite, removeMember } = useOrgStore()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (org?.role === 'admin') {
      loadDashboard()
    }
  }, [org])

  useEffect(() => {
    if (authLoading) return // Wait for auth to finish before redirecting
    if (isGuest) navigate('/login')
    else if (org && org.role !== 'admin') navigate('/')
  }, [authLoading, isGuest, org, navigate])

  // Still loading auth — show spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
      </div>
    )
  }

  // Not authenticated or not admin — redirecting
  if (isGuest || (org && org.role !== 'admin')) return null

  // No org — show create form
  if (!org) {
    return <CreateOrgForm />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">{org.name}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Organisation dashboard</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && stats && (
            <OverviewTab members={members} stats={stats} navigate={navigate} />
          )}
          {activeTab === 'analytics' && stats && (
            <AnalyticsTab members={members} stats={stats} />
          )}
          {activeTab === 'members' && (
            <MembersTab
              members={members}
              invites={invites}
              onInvite={inviteMember}
              onRevokeInvite={revokeInvite}
              onRemoveMember={removeMember}
            />
          )}
        </>
      )}
    </div>
  )
}
