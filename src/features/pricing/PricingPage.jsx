import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { IconCheck, IconUsers, IconBarChart, IconBuilding } from '@/components/Icons'

const individualFeatures = [
  'Practice questions by chapter',
  'Full mock exams (50 questions, 60 min)',
  'Personal analytics & progress tracking',
  'Spaced repetition review queue',
  'Daily streak tracking',
  'PDF & Excel progress exports',
]

const teamFeatures = [
  'Everything in Individual, plus:',
  'Team dashboard with org-wide analytics',
  'Member progress tracking & reporting',
  'Score distribution & pass rate metrics',
  'Invite & manage team members',
  'Seat-based licensing with admin controls',
  'Dedicated support',
]

export default function PricingPage() {
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', teamSize: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await Promise.resolve(api.submitSalesLead(form))
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please email us directly at sales@riskready.co.uk')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-800 dark:text-surface-100">
          Prepare your team for <span className="text-primary-600 dark:text-primary-400">CII GR1</span>
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-3 text-lg">
          Give your group risk professionals the tools to pass first time. Individual study is free — add team management when you're ready.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Individual */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <IconBarChart className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-100">Individual</h2>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">For self-study candidates</p>
          <p className="text-3xl font-bold text-surface-800 dark:text-surface-100 mb-6">
            Free
          </p>
          <ul className="space-y-3">
            {individualFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-surface-600 dark:text-surface-400">
                <IconCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/login"
            className="mt-8 block w-full text-center py-2.5 px-4 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            Get started free
          </Link>
        </div>

        {/* Teams */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border-2 border-primary-500/40 dark:border-primary-500/30 shadow-sm shadow-primary-500/5 p-6 sm:p-8 relative">
          <div className="absolute -top-3 left-6 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            For organisations
          </div>
          <div className="flex items-center gap-2 mb-1">
            <IconUsers className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-100">Teams</h2>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">For companies & training managers</p>
          <p className="text-3xl font-bold text-surface-800 dark:text-surface-100 mb-1">
            Contact us
          </p>
          <p className="text-sm text-surface-400 dark:text-surface-500 mb-6">Per-seat pricing, billed annually</p>
          <ul className="space-y-3">
            {teamFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-surface-600 dark:text-surface-400">
                <IconCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-8 block w-full text-center py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
          >
            Contact sales
          </a>
        </div>
      </div>

      {/* Contact form */}
      <div id="contact" className="max-w-xl mx-auto scroll-mt-8">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <IconBuilding className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-surface-800 dark:text-surface-100">Get in touch</h2>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
            Tell us about your team and we'll get back to you within one business day.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <IconCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-surface-800 dark:text-surface-100 mb-1">Thanks for your interest</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">We'll be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Company name</label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Your name</label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Work email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Team size</label>
                  <select
                    required
                    value={form.teamSize}
                    onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Message <span className="text-surface-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
                />
              </div>
              {error && <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {submitting ? 'Sending...' : 'Send enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
