'use client'

import { useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Droplets,
  HeartPulse,
  MapPin,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { inventory } from '@/lib/blood-inventory'

const sectionIds: Record<string, string> = {
  Overview: 'pulse-overview-header',
  'Blood inventory': 'blood-inventory',
  'Demand forecast': 'demand-forecast',
  'Donor matching': 'donor-matching',
}

const forecast = [
  { day: 'Mon', demand: 112, reserve: 154 },
  { day: 'Tue', demand: 128, reserve: 154 },
  { day: 'Wed', demand: 121, reserve: 154 },
  { day: 'Thu', demand: 146, reserve: 154 },
  { day: 'Fri', demand: 163, reserve: 154 },
  { day: 'Sat', demand: 151, reserve: 154 },
  { day: 'Sun', demand: 139, reserve: 154 },
]

const matches = [
  { initials: 'AK', name: 'Amara K.', group: 'O−', distance: '2.1 mi', interval: 'Donation interval met', score: '98%' },
  { initials: 'DC', name: 'Daniel C.', group: 'O−', distance: '3.8 mi', interval: 'Donation interval met', score: '95%' },
  { initials: 'MS', name: 'Mina S.', group: 'O−', distance: '5.4 mi', interval: 'Donation interval met', score: '92%' },
]

const metrics = [
  { label: 'Units available', value: '1,284', detail: 'Across 28 reporting centers', trend: '+6.2%', icon: Droplets, tone: 'red' },
  { label: 'Groups below reserve', value: '2', detail: 'O− and AB− need attention', trend: 'Review', icon: AlertTriangle, tone: 'amber' },
  { label: 'Open blood requests', value: '36', detail: '8 marked urgent today', trend: 'Needs review', icon: Activity, tone: 'amber' },
  { label: 'Potential donor matches', value: '18', detail: 'Pre-screening criteria met', trend: '3 urgent O−', icon: UsersRound, tone: 'green' },
]

export default function PulseOverview({ activeSection }: { activeSection: string }) {
  useEffect(() => {
    const target = document.getElementById(sectionIds[activeSection] ?? sectionIds.Overview)
    if (!target) return
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    target.scrollIntoView({ behavior, block: 'start' })
  }, [activeSection])

  return (
    <section className="pulse-overview" aria-label="Pulse Share blood network overview">
      <header className="pulse-overview-heading" id="pulse-overview-header">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD NETWORK INTELLIGENCE</p>
          <h1>Every donation, <span>where it matters.</span></h1>
          <p className="pulse-intro">A clear view of blood availability, predicted demand, and potential donor matches across your network.</p>
        </div>
        <a className="pulse-primary-link" href="#donor-matching">Find a donor match <ArrowRight aria-hidden="true" /></a>
      </header>

      <div className="pulse-demo-note" role="note">
        <span className="pulse-demo-badge">Sample data</span>
        Demo values are shown until live blood-bank and donor systems are connected.
      </div>

      <div className="pulse-alert" role="status">
        <span className="pulse-alert-icon"><AlertTriangle aria-hidden="true" /></span>
        <div className="pulse-alert-copy"><strong>Low-stock alert: O− and AB− are below reserve</strong><span>3 centers may need replenishment within 24 hours.</span></div>
        <a href="#blood-inventory">Review inventory <ArrowRight aria-hidden="true" /></a>
      </div>

      <section className="pulse-metric-grid" aria-label="Network summary">
        {metrics.map(({ label, value, detail, trend, icon: Icon, tone }) => (
          <article className="pulse-metric-card" key={label}>
            <div className="pulse-metric-top"><span>{label}</span><span className={`pulse-metric-icon ${tone}`}><Icon aria-hidden="true" /></span></div>
            <strong className="pulse-metric-value">{value}</strong>
            <div className="pulse-metric-foot"><span>{detail}</span><span className={tone === 'amber' ? 'pulse-trend attention' : 'pulse-trend'}>{tone !== 'amber' && <ArrowUpRight aria-hidden="true" />}{trend}</span></div>
          </article>
        ))}
      </section>

      <section className="pulse-panel pulse-inventory-panel" id="blood-inventory" aria-labelledby="pulse-inventory-title">
        <div className="pulse-section-heading">
          <div><p className="pulse-kicker">LIVE INVENTORY · DEMO</p><h2 id="pulse-inventory-title">Blood inventory</h2><p>Available units compared with each group&apos;s minimum reserve.</p></div>
          <div className="pulse-inventory-updated"><span className="pulse-status-dot" /> Network snapshot <span>09:42</span></div>
        </div>
        <div className="pulse-blood-grid">
          {inventory.map((item) => {
            const percent = Math.min(Math.round((item.units / item.reserve) * 100), 100)
            return (
              <article className={`pulse-blood-card ${item.tone}`} key={item.group}>
                <div className="pulse-blood-card-top"><strong>{item.group}</strong><span className="pulse-stock-status">{item.status}</span></div>
                <div className="pulse-unit-count">{item.units}<span> units</span></div>
                <div className="pulse-stock-track" role="progressbar" aria-label={`${item.group} stock against reserve`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>
                <p>{item.units < item.reserve ? `${item.reserve - item.units} below reserve` : 'Reserve target met'}</p>
              </article>
            )
          })}
        </div>
      </section>

      <div className="pulse-insight-grid">
        <section className="pulse-panel pulse-forecast-panel" id="demand-forecast" aria-labelledby="pulse-forecast-title">
          <div className="pulse-section-heading pulse-forecast-heading">
            <div><p className="pulse-kicker">AI-ASSISTED PLANNING</p><h2 id="pulse-forecast-title">7-day demand forecast</h2><p>Projected daily units needed across the network.</p></div>
            <span className="pulse-ai-chip"><Sparkles aria-hidden="true" /> Forecast</span>
          </div>
          <div className="pulse-chart-legend"><span><i className="forecast-key" /> Predicted demand</span><span><i className="reserve-key" /> Reserve guide</span></div>
          <div className="pulse-chart" role="img" aria-label="Seven-day forecast predicts blood demand rising from 112 units on Monday to 163 units on Friday, above the reserve guide of 154 units.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <defs><linearGradient id="pulseForecastFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b44d55" stopOpacity={0.24} /><stop offset="95%" stopColor="#b44d55" stopOpacity={0.015} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#e8edf0" strokeDasharray="3 5" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#78858d', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#87929a', fontSize: 10 }} />
                <Tooltip contentStyle={{ border: '1px solid #e4e9eb', borderRadius: 12, boxShadow: '0 12px 30px rgba(22, 43, 57, .12)', fontSize: 12 }} formatter={(value) => [`${value} units`, '']} />
                <Area type="monotone" dataKey="demand" name="Predicted demand" stroke="#a7414b" strokeWidth={2.5} fill="url(#pulseForecastFill)" activeDot={{ r: 4, fill: '#a7414b', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="reserve" name="Reserve guide" stroke="#82928d" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="pulse-forecast-insight"><TrendingUp aria-hidden="true" /><span><strong>Friday may exceed reserve by 9 units.</strong> Plan a targeted O− and A− collection drive.</span></div>
          <p className="pulse-forecast-footnote">Illustrative forecast only. Validate predictions against local collection and hospital data.</p>
        </section>

        <section className="pulse-panel pulse-match-panel" id="donor-matching" aria-labelledby="pulse-matches-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">URGENT REQUEST · O−</p><h2 id="pulse-matches-title">Potential donor matches</h2><p>Same blood group, nearby, donation interval met.</p></div>
            <span className="pulse-match-count">3</span>
          </div>
          <div className="pulse-match-list">
            {matches.map((match) => (
              <article className="pulse-match-row" key={match.initials}>
                <span className="pulse-donor-avatar">{match.initials}</span>
                <div className="pulse-donor-copy"><strong>{match.name} <span>{match.group}</span></strong><small><MapPin aria-hidden="true" /> {match.distance} away · {match.interval}</small></div>
                <span className="pulse-match-score">{match.score}<small>match</small></span>
              </article>
            ))}
          </div>
          <div className="pulse-match-callout"><HeartPulse aria-hidden="true" /><span><strong>Potential matches only</strong><small>Confirm eligibility and compatibility through blood-bank screening before collection.</small></span></div>
          <a className="pulse-secondary-link" href="#blood-inventory">Review inventory needs <ArrowRight aria-hidden="true" /></a>
        </section>
      </div>

      <footer className="pulse-data-footnote"><Check aria-hidden="true" /><span>Use licensed blood-bank protocols for all inventory, donor eligibility, and transfusion decisions. This screen contains illustrative sample data.</span><span className="pulse-data-date"><Clock3 aria-hidden="true" /> Snapshot · Nov 15, 2026</span></footer>
    </section>
  )
}
