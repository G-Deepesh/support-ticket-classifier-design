'use client'

import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, BellRing, Check, CircleAlert, Clock3, Droplets, MapPin, PackageCheck, RefreshCw, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { inventory } from '@/lib/blood-inventory'

const forecastByGroup = [
  { group: 'O−', demand: 168, stock: 136, daysLeft: 2 },
  { group: 'O+', demand: 248, stock: 274, daysLeft: 8 },
  { group: 'A−', demand: 126, stock: 101, daysLeft: 4 },
  { group: 'A+', demand: 219, stock: 232, daysLeft: 7 },
  { group: 'B−', demand: 88, stock: 106, daysLeft: 9 },
  { group: 'B+', demand: 145, stock: 128, daysLeft: 5 },
  { group: 'AB−', demand: 62, stock: 47, daysLeft: 2 },
  { group: 'AB+', demand: 101, stock: 119, daysLeft: 8 },
]

const forecastTrend = [
  { day: 'Today', demand: 143, stock: 158 },
  { day: 'Tue', demand: 151, stock: 156 },
  { day: 'Wed', demand: 158, stock: 151 },
  { day: 'Thu', demand: 166, stock: 148 },
  { day: 'Fri', demand: 173, stock: 144 },
  { day: 'Sat', demand: 162, stock: 139 },
  { day: 'Sun', demand: 154, stock: 134 },
]

const transferMatches = [
  { id: 'transfer-o-neg', group: 'O−', source: 'Northside Blood Center', destination: 'Central City Blood Bank', units: 24, distance: '18 km', eta: '45 min', note: 'Source stock remains above its local reserve after transfer.' },
  { id: 'transfer-ab-neg', group: 'AB−', source: 'Riverside Regional Bank', destination: 'Central City Blood Bank', units: 12, distance: '31 km', eta: '70 min', note: 'A smaller transfer may help bridge the immediate gap.' },
]

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="alerts-chart-tooltip"><strong>{label}</strong>{payload.map((item) => <span key={item.name} style={{ color: item.color }}>{item.name}: {item.value} units</span>)}</div>
}

export default function BloodBankAlertsAnalyticsView({ profileName }: { profileName: string }) {
  const [horizon, setHorizon] = useState<7 | 14>(7)
  const [drafted, setDrafted] = useState<string[]>([])
  const [reviewed, setReviewed] = useState<string[]>([])
  const scale = horizon === 7 ? 1 : 2
  const forecast = useMemo(() => forecastByGroup.map((item) => ({ ...item, demand: Math.round(item.demand * scale) })), [scale])
  const shortages = forecast.filter((item) => item.demand > item.stock)
  const lowStock = inventory.filter((item) => item.units < item.reserve)
  const totalShortage = shortages.reduce((sum, item) => sum + Math.max(0, item.demand - item.stock), 0)
  const trend = forecastTrend.map((item) => ({ ...item, demand: Math.round(item.demand * scale), stock: Math.max(0, Math.round(item.stock - (scale - 1) * 24)) }))

  const toggleItem = (values: string[], setValues: (next: string[]) => void, id: string) => {
    setValues(values.includes(id) ? values.filter((value) => value !== id) : [...values, id])
  }

  return (
    <section className="pulse-overview alerts-analytics-view" aria-labelledby="alerts-analytics-title">
      <header className="pulse-overview-heading">
        <div><p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD BANK OPERATIONS</p><h1 id="alerts-analytics-title">Alerts &amp; Analytics</h1><p className="pulse-intro">See stock risks early and coordinate replenishment across your blood-bank network.</p></div>
        <span className="pulse-ai-chip"><BellRing aria-hidden="true" /> {profileName}</span>
      </header>

      <p className="alerts-demo-note" role="note"><Sparkles aria-hidden="true" /><span><strong>Illustrative dashboard data</strong> — verify inventory, compatibility, transport conditions, and decisions with authorized transfusion staff before acting.</span></p>

      <div className="alerts-summary-grid" aria-label="Blood supply risk summary">
        <article className="alerts-summary-card"><span className="alerts-summary-icon critical"><ShieldAlert aria-hidden="true" /></span><div><small>Current low-stock alerts</small><strong>{lowStock.length} <span>groups</span></strong><em>{lowStock.map((item) => item.group).join(' · ')} below reserve</em></div></article>
        <article className="alerts-summary-card"><span className="alerts-summary-icon shortage"><TrendingDown aria-hidden="true" /></span><div><small>Predicted {horizon}-day shortage</small><strong>{totalShortage} <span>units</span></strong><em>{shortages.length} blood groups at risk</em></div></article>
        <article className="alerts-summary-card"><span className="alerts-summary-icon replenish"><RefreshCw aria-hidden="true" /></span><div><small>Replenishment suggestions</small><strong>{shortages.length} <span>actions</span></strong><em>Prioritize earliest stockout</em></div></article>
        <article className="alerts-summary-card"><span className="alerts-summary-icon transfer"><ArrowRightLeft aria-hidden="true" /></span><div><small>Potential inter-bank transfers</small><strong>{transferMatches.length} <span>matches</span></strong><em>Review local reserves first</em></div></article>
      </div>

      <div className="alerts-section-grid">
        <section className="pulse-panel alerts-panel" aria-labelledby="low-stock-heading">
          <div className="alerts-section-heading"><div><p className="pulse-kicker">CURRENT LOW STOCK</p><h2 id="low-stock-heading">Reserve threshold alerts</h2><p>Groups with fewer available units than their illustrative reserve target.</p></div><span className="alerts-count-badge critical">{lowStock.length} alerts</span></div>
          <div className="alerts-low-stock-list">{lowStock.map((item) => {
            const percentage = Math.min(100, Math.round((item.units / item.reserve) * 100))
            const isReviewed = reviewed.includes(item.group)
            return <article className={`alerts-low-stock-card${isReviewed ? ' reviewed' : ''}`} key={item.group}>
              <span className="alerts-blood-group critical">{item.group}</span>
              <div className="alerts-stock-copy"><div className="alerts-stock-title"><strong>{item.group} blood group</strong><span className="alerts-severity">{isReviewed ? 'Reviewed' : 'Critical'}</span></div><div className="alerts-stock-meta"><span>{item.units} units available</span><span>Reserve: {item.reserve}</span></div><div className="alerts-stock-track" role="progressbar" aria-label={`${item.group} stock relative to reserve`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage}%` }} /></div></div>
              <button type="button" className="alerts-review-button" aria-pressed={isReviewed} onClick={() => toggleItem(reviewed, setReviewed, item.group)}>{isReviewed ? <Check aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}{isReviewed ? 'Reviewed' : 'Review'}</button>
            </article>
          })}</div>
        </section>

        <section className="pulse-panel alerts-panel" aria-labelledby="shortage-forecast-heading">
          <div className="alerts-section-heading"><div><p className="pulse-kicker">PREDICTED BLOOD SHORTAGE</p><h2 id="shortage-forecast-heading">Network supply outlook</h2><p>Forecast demand compared with estimated available supply.</p></div><div className="alerts-horizon-toggle" role="group" aria-label="Shortage forecast range">{([7, 14] as const).map((days) => <button key={days} type="button" aria-pressed={horizon === days} className={horizon === days ? 'active' : ''} onClick={() => setHorizon(days)}>{days} days</button>)}</div></div>
          <div className="alerts-forecast-legend"><span><i className="demand-legend-predicted" /> Forecast demand</span><span><i className="alerts-legend-stock" /> Available stock</span></div>
          <div className="alerts-forecast-chart" role="img" aria-label={`${horizon}-day network outlook showing forecast demand increasing while available stock decreases.`}><ResponsiveContainer width="100%" height="100%"><BarChart data={trend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e8edf0" strokeDasharray="3 5" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#78858d', fontSize: 9 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#87929a', fontSize: 9 }} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="demand" name="Forecast demand" fill="#a7414b" radius={[4, 4, 0, 0]} maxBarSize={22} /><Bar dataKey="stock" name="Available stock" fill="#77a18f" radius={[4, 4, 0, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></div>
          <div className="alerts-forecast-callout"><TrendingDown aria-hidden="true" /><span>Network supply trends below projected demand late in this {horizon}-day outlook. Review local stock and upcoming receipts.</span></div>
        </section>
      </div>

      <section className="pulse-panel alerts-panel" aria-labelledby="group-shortage-heading">
        <div className="alerts-section-heading"><div><p className="pulse-kicker">BLOOD GROUP-WISE SHORTAGE</p><h2 id="group-shortage-heading">Projected need by blood group</h2><p>Compare available units against predicted {horizon}-day demand to pinpoint gaps.</p></div><span className="alerts-count-badge shortage">{shortages.length} projected gaps</span></div>
        <div className="alerts-table-wrap"><table className="alerts-table"><thead><tr><th scope="col">Blood group</th><th scope="col">Current stock</th><th scope="col">Forecast demand</th><th scope="col">Projected gap</th><th scope="col">Days of stock</th><th scope="col">Status</th></tr></thead><tbody>{forecast.map((item) => {
          const gap = Math.max(0, item.demand - item.stock)
          const isAtRisk = gap > 0
          return <tr key={item.group}><th scope="row"><span className={`alerts-blood-group ${isAtRisk ? 'critical' : ''}`}>{item.group}</span></th><td>{item.stock} units</td><td>{item.demand} units</td><td><strong className={isAtRisk ? 'alerts-gap critical' : 'alerts-gap healthy'}>{isAtRisk ? `−${gap}` : '—'}</strong></td><td>{item.daysLeft} days</td><td><span className={`alerts-status ${isAtRisk ? 'risk' : 'stable'}`}><i />{isAtRisk ? 'Shortage risk' : 'On track'}</span></td></tr>
        })}</tbody></table></div>
        <p className="alerts-table-footnote"><CircleAlert aria-hidden="true" /> A positive gap is a planning signal only; it does not replace compatibility checks or clinical judgment.</p>
      </section>

      <section className="pulse-panel alerts-panel" aria-labelledby="replenishment-heading">
        <div className="alerts-section-heading"><div><p className="pulse-kicker">STOCK REPLENISHMENT SUGGESTIONS</p><h2 id="replenishment-heading">Recommended next steps</h2><p>Illustrative actions based on the forecast gap, current stock, and days remaining.</p></div><span className="alerts-count-badge neutral"><PackageCheck aria-hidden="true" /> {shortages.length} suggestions</span></div>
        <div className="alerts-replenishment-list">{shortages.map((item, index) => {
          const gap = item.demand - item.stock
          const id = `replenish-${item.group}`
          const isDrafted = drafted.includes(id)
          return <article className="alerts-replenishment-card" key={item.group}><span className={`alerts-replenishment-rank ${index === 0 ? 'urgent' : ''}`}>{String(index + 1).padStart(2, '0')}</span><span className={`alerts-blood-group ${index < 2 ? 'critical' : ''}`}>{item.group}</span><div className="alerts-replenishment-copy"><strong>{index === 0 ? 'Prioritize urgent collection or replenishment' : `Plan ${item.group} stock replenishment`}</strong><span>Target at least {gap} units within {item.daysLeft} days · estimated demand {item.demand} units</span></div><span className={`alerts-suggestion-state ${isDrafted ? 'drafted' : ''}`}>{isDrafted ? 'Draft created' : 'Suggested'}</span><button type="button" className="alerts-action-button" aria-pressed={isDrafted} onClick={() => toggleItem(drafted, setDrafted, id)}>{isDrafted ? <Check aria-hidden="true" /> : <PackageCheck aria-hidden="true" />}{isDrafted ? 'Drafted' : 'Create draft'}</button></article>
        })}</div>
      </section>

      <section className="pulse-panel alerts-panel" aria-labelledby="transfer-heading">
        <div className="alerts-section-heading"><div><p className="pulse-kicker">INTER-BANK TRANSFER RECOMMENDATIONS</p><h2 id="transfer-heading">Potential network matches</h2><p>Illustrative matches to review with authorized teams before coordinating a transfer.</p></div><span className="alerts-count-badge neutral"><ArrowRightLeft aria-hidden="true" /> Network options</span></div>
        <div className="alerts-transfer-grid">{transferMatches.map((match) => {
          const isReviewed = reviewed.includes(match.id)
          return <article className="alerts-transfer-card" key={match.id}><div className="alerts-transfer-top"><span className="alerts-blood-group critical">{match.group}</span><span className="alerts-transfer-units">{match.units} units suggested</span></div><div className="alerts-transfer-route"><div><small>Potential source</small><strong>{match.source}</strong></div><ArrowRightLeft aria-label="Transfer route" /><div><small>Potential recipient</small><strong>{match.destination}</strong></div></div><div className="alerts-transfer-meta"><span><MapPin aria-hidden="true" /> {match.distance}</span><span><Clock3 aria-hidden="true" /> Est. {match.eta}</span></div><p>{match.note}</p><button type="button" className="alerts-transfer-button" aria-pressed={isReviewed} onClick={() => toggleItem(reviewed, setReviewed, match.id)}>{isReviewed ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}{isReviewed ? 'Marked for review' : 'Review recommendation'}</button></article>
        })}</div>
      </section>
    </section>
  )
}
