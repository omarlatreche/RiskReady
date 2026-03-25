import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { IconBook, IconTarget, IconRefresh, IconBarChart, IconCheck } from '@/components/Icons'

const steps = [
  {
    icon: IconBook,
    title: 'Practice by chapter',
    description: 'Work through questions topic by topic with instant feedback after each answer.',
    to: '/practice',
  },
  {
    icon: IconTarget,
    title: 'Take a mock exam',
    description: '50 questions in 60 minutes — the same format as the real CII GR1 exam.',
    to: '/mock',
  },
  {
    icon: IconRefresh,
    title: 'Review what you got wrong',
    description: 'Missed questions are added to your review queue automatically. Nail them to remove them.',
    to: '/review',
  },
  {
    icon: IconBarChart,
    title: 'Track your progress',
    description: 'See your strengths, weak chapters, and readiness score evolve over time.',
    to: '/analytics',
  },
]

export default function WelcomePage() {
  const user = useAuthStore((s) => s.user)
  const trialDaysLeft = useAuthStore((s) => s.trialDaysLeft)
  const org = useAuthStore((s) => s.org)
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 -mx-4 sm:-mx-8 lg:-mx-6 -mt-6 lg:-mt-10">
      <div className="max-w-2xl w-full py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <IconCheck className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-800 dark:text-surface-100">
            Welcome, {firstName}
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-md mx-auto">
            {org
              ? 'Your account is ready. You have full access to prepare for the CII GR1 exam.'
              : <>Your account is ready. You have{' '}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {trialDaysLeft ?? 7} days
                  </span>{' '}
                  of full access to prepare for the CII GR1 exam.</>
            }
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h2 className="text-center text-sm font-medium uppercase tracking-wider text-surface-400 dark:text-surface-500">
            How to get the most out of RiskReady
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <Link
                  key={step.to}
                  to={step.to}
                  className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm p-5 hover:shadow-md hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:-translate-y-0.5 transition-all duration-200 group block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-medium text-surface-400 dark:text-surface-500">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-surface-800 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <Link
            to="/practice"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors"
          >
            Start practising
          </Link>
          <p className="text-xs text-surface-400 dark:text-surface-500">
            We recommend starting with chapter practice, then attempting a mock exam once you feel ready.
          </p>
          <Link
            to="/"
            className="text-xs text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            Skip to dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
