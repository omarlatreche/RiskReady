import { IconBuilding } from '@/components/Icons'

export default function OrgDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">Organisation</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Manage your team's training progress.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
          <IconBuilding className="w-7 h-7 text-surface-400 dark:text-surface-500" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-2">
          Coming Soon
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md mx-auto leading-relaxed">
          Organisation features will be available once Supabase authentication is configured.
          Admins will be able to add users, assign training, and view team analytics.
        </p>
      </div>
    </div>
  )
}
