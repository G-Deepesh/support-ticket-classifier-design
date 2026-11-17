'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, BellOff, CalendarClock, Check, Clock3, Droplets, FileClock, PackageCheck, ShieldAlert, Trash2 } from 'lucide-react'

type ExpiryRecord = { id: string; group: string; component: string; units: number; collectionDate: string; expiryDate: string; location: string }
type DisposalRecord = { id: string; product: string; units: number; disposedDate: string; reason: string }
type RecordFilter = 'all' | 'soon' | 'expired' | 'disposed'

const initialRecords: ExpiryRecord[] = [
  { id: 'BBU-4912', group: 'O−', component: 'Red blood cells', units: 8, collectionDate: '2026-10-21', expiryDate: '2026-11-18', location: 'Refrigerator A · Shelf 2' },
  { id: 'BBU-4988', group: 'AB−', component: 'Platelets', units: 4, collectionDate: '2026-11-12', expiryDate: '2026-11-19', location: 'Platelet incubator · Rack 1' },
  { id: 'BBU-5021', group: 'B+', component: 'Plasma', units: 10, collectionDate: '2026-08-22', expiryDate: '2026-11-22', location: 'Freezer B · Shelf 4' },
  { id: 'BBU-5064', group: 'O+', component: 'Whole blood', units: 6, collectionDate: '2026-10-27', expiryDate: '2026-11-24', location: 'Refrigerator B · Shelf 1' },
  { id: 'BBU-4810', group: 'A+', component: 'Platelets', units: 3, collectionDate: '2026-11-08', expiryDate: '2026-11-16', location: 'Platelet incubator · Rack 3' },
  { id: 'BBU-4890', group: 'A−', component: 'Red blood cells', units: 6, collectionDate: '2026-10-30', expiryDate: '2026-11-28', location: 'Refrigerator A · Shelf 4' },
  { id: 'BBU-5035', group: 'AB+', component: 'Plasma', units: 5, collectionDate: '2026-09-05', expiryDate: '2026-12-04', location: 'Freezer A · Shelf 2' },
  { id: 'BBU-5077', group: 'B−', component: 'Whole blood', units: 3, collectionDate: '2026-11-01', expiryDate: '2026-12-12', location: 'Refrigerator C · Shelf 1' },
  { id: 'BBU-4702', group: 'B+', component: 'Plasma', units: 2, collectionDate: '2026-08-17', expiryDate: '2026-11-09', location: 'Freezer B · Shelf 2' },
]

const initialDisposals: DisposalRecord[] = [
  { id: 'DSP-1172', product: 'B+ · Plasma · BBU-4702', units: 2, disposedDate: '2026-11-10', reason: 'Expired · verified by quality team' },
]

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00Z`).getTime()
  const today = new Date(`${isoToday()}T00:00:00Z`).getTime()
  return Math.round((target - today) / 86_400_000)
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}

function expiryStatus(record: ExpiryRecord, disposed: boolean) {
  if (disposed) return 'Disposed'
  const days = daysUntil(record.expiryDate)
  if (days < 0) return 'Expired'
  if (days <= 7) return 'Expiring soon'
  return 'On track'
}

function expiryCountdown(record: ExpiryRecord) {
  const days = daysUntil(record.expiryDate)
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue`
  if (days === 0) return 'Expires today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

function makeDisposalId() {
  return `DSP-${String(Date.now()).slice(-4)}`
}

export default function BloodExpiryManagementView({ profileName }: { profileName: string }) {
  const [disposedIds, setDisposedIds] = useState<string[]>(['BBU-4702'])
  const [disposals, setDisposals] = useState(initialDisposals)
  const [filter, setFilter] = useState<RecordFilter>('all')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const activeRecords = useMemo(() => initialRecords.filter((record) => !disposedIds.includes(record.id)), [disposedIds])
  const soonRecords = activeRecords.filter((record) => {
    const days = daysUntil(record.expiryDate)
    return days >= 0 && days <= 7
  })
  const expiredRecords = activeRecords.filter((record) => daysUntil(record.expiryDate) < 0)
  const soonUnits = soonRecords.reduce((sum, record) => sum + record.units, 0)
  const expiredUnits = expiredRecords.reduce((sum, record) => sum + record.units, 0)
  const totalUnits = activeRecords.reduce((sum, record) => sum + record.units, 0)
  const sortedRecords = [...initialRecords].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
  const visibleRecords = sortedRecords.filter((record) => {
    const disposed = disposedIds.includes(record.id)
    const status = expiryStatus(record, disposed)
    if (filter === 'disposed') return disposed
    if (filter === 'soon') return !disposed && status === 'Expiring soon'
    if (filter === 'expired') return !disposed && status === 'Expired'
    return !disposed
  })

  const alerts = activeRecords.filter((record) => {
    const days = daysUntil(record.expiryDate)
    return days < 0 || days <= 7
  }).filter((record) => !dismissedAlerts.includes(record.id))

  function recordDisposal(record: ExpiryRecord) {
    if (disposedIds.includes(record.id)) return
    setDisposedIds((current) => [...current, record.id])
    setDisposals((current) => [{ id: makeDisposalId(), product: `${record.group} · ${record.component} · ${record.id}`, units: record.units, disposedDate: isoToday(), reason: 'Expired · recorded by blood bank team' }, ...current])
    setMessage(`Disposal recorded for ${record.id}.`)
  }

  function dismissAlert(record: ExpiryRecord) {
    setDismissedAlerts((current) => [...current, record.id])
    setMessage(`Expiry alert for ${record.id} marked as reviewed.`)
  }

  const filters: { value: RecordFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All Expiry Records', count: activeRecords.length },
    { value: 'soon', label: 'Expiring Soon', count: soonRecords.length },
    { value: 'expired', label: 'Expired Units', count: expiredRecords.length },
    { value: 'disposed', label: 'Disposal Records', count: disposals.length },
  ]

  return (
    <section className="pulse-overview blood-expiry-management" aria-labelledby="blood-expiry-title">
      <header className="pulse-overview-heading">
        <div><p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD BANK OPERATIONS</p><h1 id="blood-expiry-title">Expiry Management</h1><p className="pulse-intro">Track blood-unit shelf life, review expiry alerts, and record safe disposal.</p></div>
        <span className="pulse-ai-chip"><Droplets aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Expiry dates and disposal history are illustrative. Verify unit labels and follow your organization&apos;s approved quality procedures.</div>

      <section className="expiry-summary" aria-label="Expiry summary">
        <article className="expiry-summary-card"><span className="expiry-summary-icon neutral"><FileClock aria-hidden="true" /></span><span><small>All expiry records</small><strong>{activeRecords.length}</strong><em>{totalUnits.toLocaleString()} active units tracked</em></span></article>
        <article className="expiry-summary-card"><span className="expiry-summary-icon soon"><Clock3 aria-hidden="true" /></span><span><small>Expiring soon · next 7 days</small><strong>{soonUnits}</strong><em>{soonRecords.length} unit lots to review</em></span></article>
        <article className="expiry-summary-card"><span className="expiry-summary-icon expired"><AlertTriangle aria-hidden="true" /></span><span><small>Expired units</small><strong>{expiredUnits}</strong><em>{expiredRecords.length} lots awaiting disposal</em></span></article>
        <article className="expiry-summary-card"><span className="expiry-summary-icon disposed"><PackageCheck aria-hidden="true" /></span><span><small>Disposal records</small><strong>{disposals.length}</strong><em>Recorded quality actions</em></span></article>
      </section>

      <section className="expiry-section" aria-labelledby="expiry-tracking-title">
        <div className="expiry-section-heading"><div><p className="pulse-kicker">DATE MONITOR</p><h2 id="expiry-tracking-title">Expiry Date Tracking</h2><p>Upcoming milestones sorted by nearest expiry date.</p></div><span className="expiry-date-chip"><CalendarClock aria-hidden="true" /> {formatDate(isoToday())}</span></div>
        <div className="expiry-timeline">{sortedRecords.filter((record) => !disposedIds.includes(record.id) && daysUntil(record.expiryDate) >= 0).slice(0, 5).map((record) => {
          const days = daysUntil(record.expiryDate)
          return <article className={`expiry-timeline-item${days <= 7 ? ' soon' : ''}`} key={record.id}><span className="expiry-timeline-dot" /><div className="expiry-timeline-copy"><strong>{record.group} · {record.component}</strong><span>{record.id} · {record.units} {record.units === 1 ? 'unit' : 'units'}</span></div><time dateTime={record.expiryDate}>{formatDate(record.expiryDate)}</time><span className={`expiry-countdown${days <= 7 ? ' soon' : ''}`}>{expiryCountdown(record)}</span></article>
        })}</div>
      </section>

      <section className="expiry-section" aria-labelledby="expiry-records-title">
        <div className="expiry-section-heading"><div><p className="pulse-kicker">UNIT-LEVEL REGISTER</p><h2 id="expiry-records-title">Blood Unit-wise Expiry Details</h2><p>Open a view for all records, near-term expiry, expired stock, or completed disposal.</p></div></div>
        <div className="expiry-filter-tabs" role="group" aria-label="Filter expiry records">{filters.map((item) => <button key={item.value} type="button" className={filter === item.value ? 'active' : ''} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}<span>{item.count}</span></button>)}</div>
        <div className="expiry-table-wrap"><table className="expiry-table"><thead><tr><th scope="col">Unit ID</th><th scope="col">Blood group</th><th scope="col">Component</th><th scope="col">Units</th><th scope="col">Collected</th><th scope="col">Expiry date</th><th scope="col">Storage location</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>{visibleRecords.map((record) => {
          const disposed = disposedIds.includes(record.id)
          const status = expiryStatus(record, disposed)
          return <tr key={record.id}><th scope="row"><span className="expiry-unit-id">{record.id}</span></th><td><span className="blood-group-mark">{record.group}</span></td><td>{record.component}</td><td>{record.units}</td><td>{formatDate(record.collectionDate)}</td><td><strong>{formatDate(record.expiryDate)}</strong><small className="expiry-date-countdown">{disposed ? 'Disposal recorded' : expiryCountdown(record)}</small></td><td>{record.location}</td><td><span className={`expiry-status ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span></td><td>{status === 'Expired' ? <button type="button" className="expiry-dispose-button" onClick={() => recordDisposal(record)} aria-label={`Record disposal for ${record.id}`}><Trash2 aria-hidden="true" /> Record disposal</button> : disposed ? <span className="expiry-action-complete"><Check aria-hidden="true" /> Recorded</span> : <span className="expiry-no-action">—</span>}</td></tr>
        })}</tbody></table>{visibleRecords.length === 0 && <p className="expiry-empty">No records in this view.</p>}</div>
      </section>

      {message && <p className="expiry-feedback" role="status">{message}</p>}

      <section className="expiry-lower-grid" aria-label="Expiry alerts and disposal records">
        <section className="expiry-section" aria-labelledby="expiry-alerts-title">
          <div className="expiry-section-heading"><div><p className="pulse-kicker">REVIEW QUEUE</p><h2 id="expiry-alerts-title">Expiry Alerts</h2><p>Lots that expire within 7 days or are already expired.</p></div><span className="expiry-alert-count"><Bell aria-hidden="true" /> {alerts.length} active</span></div>
          {alerts.length ? <div className="expiry-alert-list">{alerts.map((record) => {
            const expired = daysUntil(record.expiryDate) < 0
            return <article className={`expiry-alert-item${expired ? ' expired' : ''}`} key={record.id}><span className="expiry-alert-icon">{expired ? <ShieldAlert aria-hidden="true" /> : <Bell aria-hidden="true" />}</span><div className="expiry-alert-copy"><strong>{expired ? 'Expired stock requires review' : 'Unit expiry approaching'}</strong><span>{record.group} · {record.component} · {record.id} · {record.units} {record.units === 1 ? 'unit' : 'units'}</span><small>{expired ? expiryCountdown(record) : `Expires ${formatDate(record.expiryDate)} · ${expiryCountdown(record)}`}</small></div><button type="button" className="expiry-dismiss-button" onClick={() => dismissAlert(record)} aria-label={`Mark alert for ${record.id} as reviewed`}><BellOff aria-hidden="true" /><span>Review</span></button></article>
          })}</div> : <p className="expiry-empty">No active expiry alerts.</p>}
        </section>

        <section className="expiry-section" aria-labelledby="disposal-records-title">
          <div className="expiry-section-heading"><div><p className="pulse-kicker">QUALITY LOG</p><h2 id="disposal-records-title">Disposal Records</h2><p>Expired stock recorded for removal from inventory.</p></div><span className="expiry-date-chip"><PackageCheck aria-hidden="true" /> {disposals.length} records</span></div>
          {disposals.length ? <div className="expiry-disposal-list">{disposals.map((record) => <article className="expiry-disposal-row" key={record.id}><span className="expiry-disposal-icon"><PackageCheck aria-hidden="true" /></span><div className="expiry-disposal-copy"><strong>{record.product}</strong><span>{record.units} {record.units === 1 ? 'unit' : 'units'} · {formatDate(record.disposedDate)}</span><small>{record.reason}</small></div><span className="expiry-disposal-id">{record.id}</span></article>)}</div> : <p className="expiry-empty">Disposal actions will appear here after expired units are recorded.</p>}
        </section>
      </section>
    </section>
  )
}
