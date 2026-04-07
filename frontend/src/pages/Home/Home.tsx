import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import type {
  DashboardOverviewExtended,
  DashboardTopTemplates,
  DashboardTrends,
} from '../../types'
import './Home.css'

const PERIOD_OPTIONS = [7, 14, 30] as const

function formatPct(rate: number | null | undefined): string {
  if (rate == null || Number.isNaN(rate)) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

function formatShortDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Home() {
  const [days, setDays] = useState<number>(7)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overviewData, setOverviewData] = useState<DashboardOverviewExtended | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [topTemplates, setTopTemplates] = useState<DashboardTopTemplates | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ov, tr, top] = await Promise.all([
        api.getDashboardOverview(days),
        api.getDashboardTrends(days),
        api.getDashboardTopTemplates(days, 5),
      ])
      setOverviewData(ov)
      setTrends(tr)
      setTopTemplates(top)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      setOverviewData(null)
      setTrends(null)
      setTopTemplates(null)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    void load()
  }, [load])

  const overview = overviewData?.overview
  const isEmpty =
    overview &&
    overview.messages_sent === 0 &&
    overview.messages_failed === 0 &&
    overview.tracked_opens === 0

  const trendMax =
    trends?.series.reduce(
      (m, d) => Math.max(m, d.sent + d.failed + d.opens),
      1,
    ) ?? 1

  if (loading && !overviewData) {
    return (
      <div className="home-loading" data-testid="home-loading">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-error" data-testid="home-error">
        <p>{error}</p>
        <button type="button" className="btn-primary" onClick={() => void load()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="home-dashboard" data-testid="home-dashboard">
      <header className="home-header">
        <div className="home-header-copy">
          <h1 className="home-title">Home</h1>
          <p className="home-subtitle">
            Track recent send activity, opens, and delivery issues for your email workflows.
          </p>
        </div>
        <div className="home-header-actions">
          <label className="home-period-label" htmlFor="home-period">
            Period
          </label>
          <select
            id="home-period"
            className="home-period-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Dashboard period in days"
          >
            {PERIOD_OPTIONS.map((d) => (
              <option key={d} value={d}>
                Last {d} days
              </option>
            ))}
          </select>
          <Link to="/templates" className="btn-primary home-templates-link">
            Manage templates
          </Link>
        </div>
      </header>

      {isEmpty && (
        <div className="home-empty-banner" data-testid="home-empty-banner">
          <h2>No email activity in the last {days} days</h2>
          <p>
            When your send pipeline posts events to{' '}
            <code className="home-code">POST /api/events/message</code> or recipients load the open
            tracking pixel, metrics will appear here.
          </p>
        </div>
      )}

      {overview && (
        <section className="home-kpis" aria-label="Key metrics">
          <article className="home-kpi-card" data-testid="home-kpi-sent">
            <span className="home-kpi-label">Sent</span>
            <span className="home-kpi-value">{overview.messages_sent}</span>
            <span className="home-kpi-hint">Messages with send/delivery events</span>
          </article>
          <article className="home-kpi-card" data-testid="home-kpi-failed">
            <span className="home-kpi-label">Failed</span>
            <span className="home-kpi-value home-kpi-value--warn">{overview.messages_failed}</span>
            <span className="home-kpi-hint">Distinct messages with failure events</span>
          </article>
          <article className="home-kpi-card" data-testid="home-kpi-opens">
            <span className="home-kpi-label">Reads (tracked opens)</span>
            <span className="home-kpi-value">{overview.tracked_opens}</span>
            <span className="home-kpi-hint">Open pixel loads in period</span>
          </article>
          <article className="home-kpi-card">
            <span className="home-kpi-label">Templates</span>
            <span className="home-kpi-value">{overview.templates_count}</span>
            <span className="home-kpi-hint">Active templates in workspace</span>
          </article>
          <article className="home-kpi-card">
            <span className="home-kpi-label">Delivery rate</span>
            <span className="home-kpi-value">{formatPct(overview.delivery_rate)}</span>
            <span className="home-kpi-hint">Delivered ÷ sent (event-based)</span>
          </article>
          <article className="home-kpi-card">
            <span className="home-kpi-label">Open rate</span>
            <span className="home-kpi-value">{formatPct(overview.open_rate)}</span>
            <span className="home-kpi-hint">Unique opens ÷ delivered (or sent)</span>
          </article>
        </section>
      )}

      {trends && (
        <section className="home-section" aria-labelledby="home-trends-heading">
          <h2 id="home-trends-heading" className="home-section-title">
            Activity by day
          </h2>
          {trends.series.length === 0 ? (
            <p className="home-section-empty" data-testid="home-trend-empty">
              No daily trend data for the last {days} days.
            </p>
          ) : (
            <>
              <div className="home-trend-chart" data-testid="home-trend-chart" aria-hidden="true">
                <div className="home-trend-legend">
                  <span>
                    <i className="home-trend-dot home-trend-dot--sent" /> Sent
                  </span>
                  <span>
                    <i className="home-trend-dot home-trend-dot--failed" /> Failed
                  </span>
                  <span>
                    <i className="home-trend-dot home-trend-dot--opens" /> Opens
                  </span>
                </div>
                <div className="home-trend-bars">
                  {trends.series.map((day) => {
                    const hSent = trendMax ? (day.sent / trendMax) * 100 : 0
                    const hFailed = trendMax ? (day.failed / trendMax) * 100 : 0
                    const hOpens = trendMax ? (day.opens / trendMax) * 100 : 0
                    return (
                      <div key={day.date} className="home-trend-col" title={day.date}>
                        <div className="home-trend-stack">
                          <div
                            className="home-trend-seg home-trend-seg--opens"
                            style={{ height: `${hOpens}%` }}
                          />
                          <div
                            className="home-trend-seg home-trend-seg--failed"
                            style={{ height: `${hFailed}%` }}
                          />
                          <div
                            className="home-trend-seg home-trend-seg--sent"
                            style={{ height: `${hSent}%` }}
                          />
                        </div>
                        <span className="home-trend-day">
                          {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, {
                            weekday: 'narrow',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <table className="home-trend-table sr-only" data-testid="home-trend-table">
                <caption>Daily sent, failed, and open totals for the selected period.</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Sent</th>
                    <th scope="col">Failed</th>
                    <th scope="col">Opens</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.series.map((day) => (
                    <tr key={`${day.date}-table`}>
                      <th scope="row">{day.date}</th>
                      <td>{day.sent}</td>
                      <td>{day.failed}</td>
                      <td>{day.opens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}

      {(topTemplates || overviewData) && (
        <div className="home-two-col">
          {topTemplates && (
            <section className="home-section" aria-labelledby="home-top-heading">
              <h2 id="home-top-heading" className="home-section-title">
                Top templates
              </h2>
              {topTemplates.templates.length === 0 ? (
                <p className="home-section-empty" data-testid="home-top-empty">
                  No template activity in the last {days} days.
                </p>
              ) : (
                <ul className="home-top-list" data-testid="home-top-templates">
                  {topTemplates.templates.map((t) => (
                    <li key={t.template_id} className="home-top-row">
                      <span className="home-top-name">{t.template_name}</span>
                      <span className="home-top-stats">
                        {t.send_count} sends · {t.open_count} opens
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {overviewData && (
            <section className="home-section" aria-labelledby="home-fail-heading">
              <h2 id="home-fail-heading" className="home-section-title">
                Recent failures
              </h2>
              {overviewData.recent_failures.length === 0 ? (
                <p className="home-section-empty" data-testid="home-fail-empty">
                  No delivery failures in the last {days} days.
                </p>
              ) : (
                <ul className="home-fail-list" data-testid="home-recent-failures">
                  {overviewData.recent_failures.map((f) => (
                    <li key={f.message_id} className="home-fail-row">
                      <div className="home-fail-main">
                        <span className="home-fail-recipient">{f.recipient}</span>
                        {f.subject && <span className="home-fail-subject">{f.subject}</span>}
                      </div>
                      <div className="home-fail-meta">
                        <span className="home-fail-reason">{f.failure_reason || 'Unknown error'}</span>
                        <span className="home-fail-time">{formatShortDate(f.failed_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}

      {loading && overviewData && (
        <div className="home-refreshing" aria-live="polite">
          Updating…
        </div>
      )}
    </div>
  )
}
