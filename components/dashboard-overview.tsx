'use client'

import { useState } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, CalendarDays, Check, Clock3, Droplets,
  Heart, Hospital, MapPin, PackageCheck, Plus, ShieldCheck, Truck, UsersRound,
} from 'lucide-react'

type Profile = 'donor' | 'hospital' | 'bloodBank'

export default function DashboardOverview({ profile, name, onNavigate }: { profile: Profile; name: string; onNavigate: (section: string) => void }) {
  if (profile === 'donor') return <DonorOverview name={name} onNavigate={onNavigate} />
  if (profile === 'hospital') return <HospitalOverview name={name} onNavigate={onNavigate} />
  return <BloodBankOverview name={name} onNavigate={onNavigate} />
}

function OverviewHeader({ eyebrow, title, detail, icon: Icon }: { eyebrow: string; title: string; detail: string; icon: typeof Heart }) {
  return <header className="dash-overview-header"><div><p className="dash-eyebrow"><span />{eyebrow}</p><h1>{title}</h1><p>{detail}</p></div><span className="dash-header-icon"><Icon aria-hidden="true" /></span></header>
}

function Metric({ label, value, detail, icon: Icon, tone = '' }: { label: string; value: string; detail: string; icon: typeof Heart; tone?: string }) {
  return <article className="dash-overview-metric"><span className={`dash-metric-icon ${tone}`}><Icon aria-hidden="true" /></span><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>
}

function DonorOverview({ name, onNavigate }: { name: string; onNavigate: (section: string) => void }) {
  const [appointment, setAppointment] = useState(false)
  const [impactOpen, setImpactOpen] = useState(false)
  return <section className="dash-overview donor-overview" aria-label="Donor dashboard overview">
    <OverviewHeader eyebrow="YOUR DONOR DASHBOARD" title={`Good morning, ${name.split(' ')[0]}`} detail="A small act can make an extraordinary difference. Here’s your donor journey at a glance." icon={Heart} />
    <div className="dash-sample-note">Illustrative dashboard data <span>•</span> Eligibility and donation timing are confirmed by your donation center.</div>
    <div className="dash-metric-grid"><Metric label="Donations made" value="4" detail="You’ve helped up to 12 people" icon={Droplets} tone="red"/><Metric label="Next eligible date" value="Dec 04" detail="Confirm with your center" icon={CalendarDays}/><Metric label="Donor status" value="Active" detail="Profile ready for your next visit" icon={ShieldCheck} tone="green"/></div>
    <div className="dash-feature-grid donor-feature-grid">
      <section className="dash-overview-card donor-appointment"><div className="dash-card-topline"><span className="dash-card-icon"><CalendarDays /></span><span className="dash-status-pill">UP NEXT</span></div><p className="dash-card-eyebrow">YOUR NEXT VISIT</p><h2>{appointment ? 'Appointment request sent' : 'Make your next donation count'}</h2><p>{appointment ? 'Your preferred center will confirm a time. Check with staff before donating.' : 'Your next donation window is coming up. Choose a nearby center to plan a visit.'}</p><div className="dash-appointment-location"><MapPin /><span><strong>City Center Blood Drive</strong><small>2.1 miles away · Sat, Dec 05</small></span><ArrowRight /></div><button className="dash-action-button" type="button" onClick={() => setAppointment((value) => !value)}>{appointment ? <><Check /> Request sent</> : <>Plan a visit <ArrowRight /></>}</button></section>
      <section className="dash-overview-card donor-impact"><div className="dash-section-title"><div><p className="dash-card-eyebrow">YOUR IMPACT</p><h2>Every donation matters</h2></div><Heart /></div><div className="dash-impact-stat"><strong>12</strong><span>potential lives touched</span></div><div className="dash-impact-track" role="progressbar" aria-label="Progress toward five donations" aria-valuemin={0} aria-valuemax={5} aria-valuenow={4}><span /></div><div className="dash-impact-footer"><span>4 of 5 donations</span><button type="button" onClick={() => setImpactOpen((open) => !open)} aria-expanded={impactOpen}>{impactOpen ? 'Hide details' : 'View your journey'} <ArrowRight /></button></div>{impactOpen && <p className="dash-expanded-note">Your next milestone is one donation away. Donation counts and impact are illustrative; ask your center for your verified history.</p>}</section>
    </div>
    <section className="dash-overview-card dash-donor-reminder"><span className="dash-reminder-icon"><Clock3 /></span><div><strong>Quick reminder</strong><p>Eat well, stay hydrated, and follow your donation center’s preparation guidance before your visit.</p></div><button type="button" onClick={() => onNavigate('Eligibility Status')}>Check eligibility <ArrowRight /></button></section>
  </section>
}

const initialRequests = [
  { id: 'REQ-2841', patient: 'Emergency surgery', group: 'O−', units: '4 units', urgency: 'Critical', eta: 'Awaiting allocation' },
  { id: 'REQ-2838', patient: 'Maternity ward', group: 'A+', units: '2 units', urgency: 'Urgent', eta: 'In review' },
  { id: 'REQ-2831', patient: 'Oncology', group: 'B+', units: '3 units', urgency: 'Routine', eta: 'Ready to dispatch' },
]

function HospitalOverview({ name, onNavigate }: { name: string; onNavigate: (section: string) => void }) {
  const [filter, setFilter] = useState<'All requests' | 'Needs attention'>('All requests')
  const [received, setReceived] = useState<string[]>([])
  const requests = initialRequests.filter((request) => !received.includes(request.id) && (filter === 'All requests' || request.urgency !== 'Routine'))
  return <section className="dash-overview hospital-overview" aria-label="Hospital dashboard overview">
    <OverviewHeader eyebrow="HOSPITAL OPERATIONS" title="Care starts with readiness" detail={`${name} · Your blood supply and care coordination, all in one place.`} icon={Hospital}/>
    <div className="dash-sample-note">Network snapshot · Sample data <span>•</span> Confirm availability and compatibility with your transfusion service.</div>
    <div className="dash-metric-grid"><Metric label="Open requests" value="12" detail="Across active departments" icon={Activity}/><Metric label="Needs attention" value="3" detail="Critical requests need review" icon={Clock3} tone="red"/><Metric label="Available units" value="1,284" detail="Across 28 reporting centers" icon={Droplets} tone="green"/></div>
    <section className="dash-overview-card dash-requests-card"><div className="dash-section-title request-title"><div><p className="dash-card-eyebrow">CARE COORDINATION</p><h2>Active blood requests</h2><p>Prioritize requests and follow each delivery through to receipt.</p></div><button className="dash-action-button compact" type="button" onClick={() => onNavigate('Blood request')}><Plus /> New request</button></div>
      <div className="dash-filter-tabs" role="group" aria-label="Filter blood requests">{(['All requests', 'Needs attention'] as const).map((item) => <button key={item} type="button" className={filter === item ? 'selected' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="dash-request-list">{requests.map((request) => <article className="dash-request-row" key={request.id}><span className={`dash-urgency-dot ${request.urgency.toLowerCase()}`} aria-hidden="true"/><div className="dash-request-patient"><strong>{request.patient}</strong><small>{request.id} · {request.urgency} priority</small></div><span className="dash-blood-type">{request.group}<small>{request.units}</small></span><span className="dash-request-status"><i />{request.eta}</span><button className="dash-row-action" type="button" onClick={() => request.eta === 'Ready to dispatch' ? setReceived((list) => [...list, request.id]) : onNavigate('Delivery Request tracking')}>{request.eta === 'Ready to dispatch' ? 'Mark received' : 'Track'} <ArrowRight /></button></article>)}</div>
      {requests.length === 0 && <p className="dash-empty-state" role="status">No requests match this filter. Try viewing all requests.</p>}
      {received.length > 0 && <p className="dash-inline-success" role="status"><Check /> Receipt recorded in this demo.</p>}
    </section>
    <div className="dash-hospital-footer"><span><Truck /> 5 deliveries in transit</span><button type="button" onClick={() => onNavigate('Delivery Request tracking')}>Track deliveries <ArrowRight /></button><span><UsersRound /> 8 cases in review</span><button type="button" onClick={() => onNavigate('Patient matching')}>Review matches <ArrowRight /></button></div>
  </section>
}

const stockGroups = [
  { group: 'O−', units: 42, reserve: 60, tone: 'critical' },
  { group: 'A−', units: 86, reserve: 70, tone: 'healthy' },
  { group: 'B+', units: 118, reserve: 80, tone: 'healthy' },
  { group: 'AB−', units: 18, reserve: 30, tone: 'low' },
]

function BloodBankOverview({ name, onNavigate }: { name: string; onNavigate: (section: string) => void }) {
  const [range, setRange] = useState('7 days')
  const [acknowledged, setAcknowledged] = useState<string[]>([])
  const [stockFilter, setStockFilter] = useState('All groups')
  const lowStock = stockGroups.filter((stock) => stock.units < stock.reserve)
  const visibleStock = stockFilter === 'Needs restock' ? lowStock : stockGroups
  return <section className="dash-overview bloodbank-overview" aria-label="Blood bank dashboard overview">
    <OverviewHeader eyebrow="BLOOD BANK OPERATIONS" title="Supply, under control." detail={`${name} · A focused operational snapshot to help you act before a shortage becomes urgent.`} icon={Droplets}/>
    <div className="dash-sample-note">Illustrative network snapshot <span>•</span> Review all stock movements and clinical decisions in your source systems.</div>
    <div className="dash-metric-grid"><Metric label="Total units" value="1,284" detail="Across tracked components" icon={PackageCheck} tone="green"/><Metric label="Below reserve" value="2 groups" detail="O− and AB− need replenishment" icon={Activity} tone="red"/><Metric label="Requests to review" value="11" detail="3 marked urgent" icon={Hospital}/></div>
    <div className="dash-feature-grid bank-feature-grid"><section className="dash-overview-card dash-stock-card"><div className="dash-section-title"><div><p className="dash-card-eyebrow">STOCK HEALTH</p><h2>Inventory by blood group</h2></div><select aria-label="Filter inventory groups" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}><option>All groups</option><option>Needs restock</option></select></div><div className="dash-stock-list">{visibleStock.map((item) => { const percent = Math.min((item.units / item.reserve) * 100, 100); return <div className="dash-stock-row" key={item.group}><strong>{item.group}</strong><div className="dash-stock-bar" role="progressbar" aria-label={`${item.group} stock against reserve`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(Math.round(percent),100)}><span className={item.tone} style={{ width: `${percent}%` }}/></div><span className="dash-stock-count">{item.units}<small> / {item.reserve}</small></span><span className={`dash-stock-state ${item.tone}`}>{item.units < item.reserve ? 'Restock' : 'Healthy'}</span></div> })}</div><button type="button" className="dash-text-action" onClick={() => onNavigate('Blood Inventory Management')}>Open inventory <ArrowRight /></button></section>
      <section className="dash-overview-card dash-demand-card"><div className="dash-section-title"><div><p className="dash-card-eyebrow">DEMAND PLANNING</p><h2>Forecast outlook</h2></div><select aria-label="Forecast period" value={range} onChange={(event) => setRange(event.target.value)}><option>7 days</option><option>14 days</option><option>30 days</option></select></div><div className="dash-forecast-total"><strong>{range === '7 days' ? '1,107' : range === '14 days' ? '2,214' : '4,685'}</strong><span>units projected</span><ArrowUpRight /></div><div className="dash-forecast-bars" aria-label={`Illustrative ${range} blood demand forecast`}>{[38,54,44,68,88,72,58].map((height,index)=><span key={index} style={{height:`${height}%`}} title={`Day ${index+1}`} />)}</div><div className="dash-forecast-caption"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div><p className="dash-demand-insight"><Activity /> Expected peak Friday <strong>· 173 units</strong></p><button type="button" className="dash-text-action" onClick={() => onNavigate('Demand forecast')}>Explore forecast <ArrowRight /></button></section></div>
    <section className="dash-overview-card dash-alerts-card"><div className="dash-section-title"><div><p className="dash-card-eyebrow">ACTION CENTER</p><h2>Priority alerts</h2></div><span className="dash-alert-count">{lowStock.filter((item) => !acknowledged.includes(item.group)).length} active</span></div><div className="dash-alert-list">{lowStock.filter((item) => !acknowledged.includes(item.group)).map((item) => <div className="dash-alert-row" key={item.group}><span className="dash-alert-mark"><Activity /></span><span><strong>{item.group} below reserve</strong><small>{item.units} units on hand · target {item.reserve} · replenish soon</small></span><button type="button" onClick={() => setAcknowledged((items) => [...items, item.group])}>Acknowledge <Check /></button></div>)}{lowStock.every((item) => acknowledged.includes(item.group)) && <p className="dash-empty-state" role="status">All stock alerts acknowledged for this session.</p>}</div><button type="button" className="dash-text-action" onClick={() => onNavigate('Alerts & Analytics')}>View all analytics <ArrowRight /></button></section>
    <p className="dash-bank-footnote"><ShieldCheck /> Always follow local handling, traceability, and transfusion protocols.</p>
  </section>
}
