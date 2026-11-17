'use client'

import { useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, CircleAlert, FileText, Sparkles, TrendingUp } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const sevenDayForecast = [
  { day: 'Mon', demand: 143, reserve: 150 },
  { day: 'Tue', demand: 151, reserve: 150 },
  { day: 'Wed', demand: 158, reserve: 150 },
  { day: 'Thu', demand: 166, reserve: 150 },
  { day: 'Fri', demand: 173, reserve: 150 },
  { day: 'Sat', demand: 162, reserve: 150 },
  { day: 'Sun', demand: 154, reserve: 150 },
]

const thirtyDayForecast = Array.from({ length: 30 }, (_, index) => {
  const wave = Math.round(13 * Math.sin(index / 3.4) + 8 * Math.cos(index / 2.1))
  const trend = Math.round(index * 0.55)
  const demand = 146 + wave + trend
  return { day: `Day ${index + 1}`, demand, reserve: 150 }
})

const groupForecast = [
  { group: 'O−', demand: 168, stock: 136 },
  { group: 'O+', demand: 248, stock: 274 },
  { group: 'A−', demand: 126, stock: 101 },
  { group: 'A+', demand: 219, stock: 232 },
  { group: 'B−', demand: 88, stock: 106 },
  { group: 'B+', demand: 145, stock: 128 },
  { group: 'AB−', demand: 62, stock: 47 },
  { group: 'AB+', demand: 101, stock: 119 },
]

const componentForecast = [
  { component: 'Red blood cells', shortName: 'Red cells', sevenDay: 630, stock: 482, thirtyDay: 2540, thirtyDayStock: 2140 },
  { component: 'Platelets', shortName: 'Platelets', sevenDay: 294, stock: 210, thirtyDay: 1170, thirtyDayStock: 960 },
  { component: 'Plasma', shortName: 'Plasma', sevenDay: 144, stock: 320, thirtyDay: 578, thirtyDayStock: 1280 },
  { component: 'Whole blood', shortName: 'Whole blood', sevenDay: 102, stock: 85, thirtyDay: 410, thirtyDayStock: 360 },
]

const historicalDemand = [
  { month: 'Jan', current: 4180, previous: 3950 }, { month: 'Feb', current: 3910, previous: 3780 },
  { month: 'Mar', current: 4320, previous: 4050 }, { month: 'Apr', current: 4470, previous: 4240 },
  { month: 'May', current: 4680, previous: 4390 }, { month: 'Jun', current: 4820, previous: 4510 },
  { month: 'Jul', current: 5010, previous: 4670 }, { month: 'Aug', current: 4930, previous: 4790 },
  { month: 'Sep', current: 5160, previous: 4840 }, { month: 'Oct', current: 5280, previous: 4980 },
  { month: 'Nov', current: null, previous: 5120 }, { month: 'Dec', current: null, previous: 5370 },
]

const seasonalTrends = [
  { season: 'Winter', months: 'Dec – Feb', change: '+12%', detail: 'Red cell demand typically rises', tone: 'warm' },
  { season: 'Spring', months: 'Mar – May', change: '+7%', detail: 'Platelet requests trend upward', tone: 'green' },
  { season: 'Summer', months: 'Jun – Aug', change: '+9%', detail: 'Plasma demand sees a seasonal lift', tone: 'blue' },
  { season: 'Fall', months: 'Sep – Nov', change: '+5%', detail: 'Network-wide demand stays elevated', tone: 'amber' },
]

const reports = [
  { id: 'weekly', title: 'Weekly demand outlook', date: 'Nov 17, 2026', range: '7-day forecast', confidence: 'High', summary: 'Projected demand is trending above the sample reserve guide on five of the next seven days. O−, A−, and B+ show the largest illustrative replenishment gaps.' },
  { id: 'monthly', title: 'Monthly supply risk brief', date: 'Nov 16, 2026', range: '30-day forecast', confidence: 'Moderate', summary: 'Red cells and platelets account for most of the projected 30-day need. Consider reviewing collection capacity and local stock before adjusting allocations.' },
  { id: 'seasonal', title: 'Seasonal trend review', date: 'Nov 12, 2026', range: 'Historical analysis', confidence: 'Moderate', summary: 'Illustrative year-over-year demand is higher through late summer and fall. Compare this signal with local events, donor availability, and hospital utilization.' },
]

function ForecastTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="demand-chart-tooltip"><strong>{label}</strong>{payload.filter((item) => item.value !== undefined).map((item) => <span key={item.name} style={{ color: item.color }}>{item.name}: {item.value?.toLocaleString()} units</span>)}</div>
}

export default function BloodDemandForecastView({ profileName }: { profileName: string }) {
  const [range, setRange] = useState<7 | 30>(7)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const forecastData = range === 7 ? sevenDayForecast : thirtyDayForecast
  const totalDemand = useMemo(() => forecastData.reduce((sum, day) => sum + day.demand, 0), [forecastData])
  const peakDay = forecastData.reduce((peak, day) => day.demand > peak.demand ? day : peak, forecastData[0])
  const groupData = groupForecast.map((item) => ({ ...item, demand: range === 7 ? item.demand : Math.round(item.demand * 4.2) }))
  const componentData = componentForecast.map((item) => ({ ...item, demand: range === 7 ? item.sevenDay : item.thirtyDay, stock: range === 7 ? item.stock : item.thirtyDayStock }))
  const gapCount = componentData.filter((item) => item.demand > item.stock).length

  return (
    <section className="pulse-overview demand-forecast-view" aria-labelledby="demand-forecast-title">
      <header className="pulse-overview-heading">
        <div><p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD BANK OPERATIONS</p><h1 id="demand-forecast-title">Demand Forecast</h1><p className="pulse-intro">Plan collection and replenishment with an at-a-glance view of predicted blood demand.</p></div>
        <span className="pulse-ai-chip"><BarChart3 aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Forecasts and reports are illustrative dashboard content, not clinical guidance or a live prediction model.</div>

      <div className="demand-overview-grid" aria-label="Overall demand forecast summary">
        <article className="demand-overview-card"><span className="demand-overview-icon"><TrendingUp aria-hidden="true" /></span><div><small>Overall demand forecast</small><strong>{totalDemand.toLocaleString()} <span>units</span></strong><em>Next {range} days · network-wide</em></div></article>
        <article className="demand-overview-card"><span className="demand-overview-icon peak"><Activity aria-hidden="true" /></span><div><small>Peak projected day</small><strong>{peakDay.demand} <span>units</span></strong><em>{peakDay.day} · highest expected demand</em></div></article>
        <article className="demand-overview-card"><span className="demand-overview-icon gap"><CircleAlert aria-hidden="true" /></span><div><small>Components above stock</small><strong>{gapCount} <span>of 4</span></strong><em>Review projected replenishment gaps</em></div></article>
        <article className="demand-overview-card"><span className="demand-overview-icon report"><Sparkles aria-hidden="true" /></span><div><small>Prediction reports</small><strong>{reports.length} <span>available</span></strong><em>Last updated {reports[0].date}</em></div></article>
      </div>

      <section className="pulse-panel demand-panel" aria-labelledby="overall-forecast-heading">
        <div className="pulse-section-heading demand-section-heading"><div><p className="pulse-kicker">OVERALL DEMAND FORECAST</p><h2 id="overall-forecast-heading">Predicted blood-unit demand</h2><p>Projected daily demand compared with the illustrative reserve guide.</p></div><div className="demand-range-toggle" role="group" aria-label="Forecast range">{([7, 30] as const).map((days) => <button key={days} type="button" className={range === days ? 'active' : ''} aria-pressed={range === days} onClick={() => setRange(days)}>{days}-day forecast</button>)}</div></div>
        <div className="demand-chart-legend"><span><i className="demand-legend-predicted" /> Predicted demand</span><span><i className="demand-legend-reserve" /> Reserve guide</span></div>
        <div className="demand-main-chart" role="img" aria-label={`${range}-day demand forecast. Total projected demand ${totalDemand.toLocaleString()} units. Peak ${peakDay.demand} units on ${peakDay.day}.`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={forecastData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><defs><linearGradient id="demandForecastFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b44d55" stopOpacity={0.23} /><stop offset="95%" stopColor="#b44d55" stopOpacity={0.015} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8edf0" strokeDasharray="3 5" /><XAxis dataKey="day" axisLine={false} tickLine={false} interval={range === 30 ? 4 : 0} tick={{ fill: '#78858d', fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#87929a', fontSize: 9 }} /><Tooltip content={<ForecastTooltip />} /><Area type="monotone" dataKey="demand" name="Predicted demand" stroke="#a7414b" strokeWidth={2.5} fill="url(#demandForecastFill)" activeDot={{ r: 4, fill: '#a7414b', stroke: '#fff', strokeWidth: 2 }} /><Line type="monotone" dataKey="reserve" name="Reserve guide" stroke="#82928d" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} /></AreaChart></ResponsiveContainer></div>
        <div className="demand-chart-foot"><span><CalendarDays aria-hidden="true" /> {range === 7 ? '7-Day Demand Forecast' : '30-Day Demand Forecast'}</span><span>Peak estimate: {peakDay.demand} units · {peakDay.day}</span></div>
      </section>

      <div className="demand-prediction-grid">
        <section className="pulse-panel demand-panel" aria-labelledby="blood-group-prediction-heading">
          <div className="pulse-section-heading"><div><p className="pulse-kicker">BLOOD GROUP-WISE PREDICTION</p><h2 id="blood-group-prediction-heading">Projected need by blood group</h2><p>Demand compared with the current illustrative stock estimate.</p></div></div>
          <div className="demand-group-chart" role="img" aria-label={`Projected ${range}-day demand and stock by blood group.`}><ResponsiveContainer width="100%" height="100%"><BarChart data={groupData} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e8edf0" strokeDasharray="3 5" /><XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: '#78858d', fontSize: 9 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#87929a', fontSize: 9 }} /><Tooltip content={<ForecastTooltip />} /><Bar dataKey="demand" name="Predicted demand" fill="#a7414b" radius={[4, 4, 0, 0]} maxBarSize={22} /><Bar dataKey="stock" name="Current stock" fill="#7aa495" radius={[4, 4, 0, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></div>
          <div className="demand-legend-row"><span><i className="demand-legend-predicted" /> Predicted demand</span><span><i className="demand-legend-stock" /> Current stock</span></div>
        </section>

        <section className="pulse-panel demand-panel" aria-labelledby="component-prediction-heading">
          <div className="pulse-section-heading"><div><p className="pulse-kicker">COMPONENT-WISE PREDICTION</p><h2 id="component-prediction-heading">Projected demand by component</h2><p>Estimated need and stock gap for the selected forecast window.</p></div></div>
          <div className="demand-component-table-wrap"><table className="demand-component-table"><thead><tr><th scope="col">Component</th><th scope="col">Demand</th><th scope="col">Stock</th><th scope="col">Gap</th></tr></thead><tbody>{componentData.map((item) => {
            const gap = item.demand - item.stock
            return <tr key={item.component}><th scope="row"><span>{item.shortName}</span></th><td>{item.demand.toLocaleString()}</td><td>{item.stock.toLocaleString()}</td><td><span className={`demand-gap ${gap > 0 ? 'shortage' : 'surplus'}`}>{gap > 0 ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}{gap > 0 ? '+' : ''}{gap.toLocaleString()}</span></td></tr>
          })}</tbody></table></div>
          <p className="demand-component-note"><CircleAlert aria-hidden="true" /> A positive gap indicates projected demand exceeds sample stock.</p>
        </section>
      </div>

      <section className="pulse-panel demand-panel" aria-labelledby="historical-analysis-heading">
        <div className="pulse-section-heading"><div><p className="pulse-kicker">HISTORICAL DEMAND ANALYSIS</p><h2 id="historical-analysis-heading">Year-over-year demand</h2><p>Monthly demand history to help spot sustained shifts before planning collections.</p></div><span className="demand-history-badge"><TrendingUp aria-hidden="true" /> +8.4% YTD</span></div>
        <div className="demand-history-chart" role="img" aria-label="Monthly demand history comparing current year with previous year. Current-year values are shown through October; remaining months are not yet available."><ResponsiveContainer width="100%" height="100%"><LineChart data={historicalDemand} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e8edf0" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#78858d', fontSize: 9 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#87929a', fontSize: 9 }} /><Tooltip content={<ForecastTooltip />} /><Line connectNulls={false} type="monotone" dataKey="current" name="Current year" stroke="#a7414b" strokeWidth={2.5} dot={{ r: 2.5, fill: '#a7414b' }} activeDot={{ r: 4 }} /><Line type="monotone" dataKey="previous" name="Previous year" stroke="#7aa495" strokeWidth={1.8} strokeDasharray="4 4" dot={false} /></LineChart></ResponsiveContainer></div>
        <div className="demand-legend-row"><span><i className="demand-legend-predicted" /> Current year · through October</span><span><i className="demand-legend-stock" /> Previous year</span></div>
      </section>

      <section className="pulse-panel demand-panel" aria-labelledby="seasonal-trends-heading">
        <div className="pulse-section-heading"><div><p className="pulse-kicker">SEASONAL DEMAND TRENDS</p><h2 id="seasonal-trends-heading">Seasonal planning signals</h2><p>Illustrative recurring patterns by season, with common component-level drivers.</p></div></div>
        <div className="demand-season-grid">{seasonalTrends.map((item) => <article className="demand-season-card" key={item.season}><div className="demand-season-top"><span className={`demand-season-icon ${item.tone}`}><CalendarDays aria-hidden="true" /></span><span>{item.months}</span></div><strong>{item.season}</strong><p>{item.detail}</p><span className={`demand-season-change ${item.tone}`}><ArrowUpRight aria-hidden="true" /> {item.change} typical demand</span></article>)}</div>
      </section>

      <section className="pulse-panel demand-panel" aria-labelledby="prediction-reports-heading">
        <div className="pulse-section-heading"><div><p className="pulse-kicker">AI PREDICTION REPORTS</p><h2 id="prediction-reports-heading">Forecast reports &amp; planning notes</h2><p>Review sample model summaries and their highlighted planning considerations.</p></div><span className="demand-ai-report-label"><Sparkles aria-hidden="true" /> Sample reports</span></div>
        <div className="demand-report-list">{reports.map((report) => {
          const expanded = expandedReport === report.id
          return <article className={`demand-report-card${expanded ? ' expanded' : ''}`} key={report.id}><span className="demand-report-icon"><FileText aria-hidden="true" /></span><div className="demand-report-copy"><div className="demand-report-title-row"><strong>{report.title}</strong><span className="demand-confidence">{report.confidence} confidence</span></div><span>{report.range} · {report.date}</span>{expanded && <p>{report.summary}</p>}</div><button type="button" className="demand-report-button" aria-expanded={expanded} onClick={() => setExpandedReport(expanded ? null : report.id)}>{expanded ? 'Close report' : 'View report'}</button></article>
        })}</div>
        <p className="demand-report-footnote"><CircleAlert aria-hidden="true" /> Demo reports are illustrative summaries, not generated from live operational data. Review local history and clinical protocols before acting.</p>
      </section>
    </section>
  )
}
