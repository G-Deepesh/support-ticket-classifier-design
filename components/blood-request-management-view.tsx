'use client'

import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Check, ChevronRight, Clock3, Droplets, Inbox, ListTodo, Search, Truck, X } from 'lucide-react'

const sections = [
  { label: 'All Incoming Requests', icon: Inbox, count: 36, detail: 'Review every request across the network.' },
  { label: 'New Requests', icon: ListTodo, count: 12, detail: 'Triage newly submitted requests.' },
  { label: 'Pending Requests', icon: Clock3, count: 11, detail: 'Follow up on requests awaiting review or stock.' },
  { label: 'Approved Requests', icon: Check, count: 14, detail: 'Prepare approved requests for allocation.' },
  { label: 'Rejected Requests', icon: X, count: 4, detail: 'Review declined requests and recorded decisions.' },
  { label: 'Allocate Blood Units', icon: Droplets, count: 9, detail: 'Coordinate allocation for approved requests.' },
  { label: 'Dispatch Management', icon: Truck, count: 5, detail: 'Coordinate dispatch and delivery status.' },
  { label: 'Request Fulfilment History', icon: CalendarDays, count: 19, detail: 'Review completed request fulfilments.' },
] as const

const requests = [
  { id: 'BR-2048', hospital: 'Northside Medical Center', group: 'O−', component: 'Red blood cells', units: 4, priority: 'Emergency', status: 'New', time: '8 min ago' },
  { id: 'BR-2047', hospital: 'St. Mary’s Hospital', group: 'A+', component: 'Platelets', units: 6, priority: 'Urgent', status: 'Pending', time: '24 min ago' },
  { id: 'BR-2046', hospital: 'Riverside General', group: 'B−', component: 'Plasma', units: 2, priority: 'Routine', status: 'Approved', time: '41 min ago' },
  { id: 'BR-2045', hospital: 'Central City Hospital', group: 'AB+', component: 'Whole blood', units: 3, priority: 'Urgent', status: 'Allocated', time: '1 hr ago' },
  { id: 'BR-2044', hospital: 'Valley Children’s', group: 'O+', component: 'Red blood cells', units: 8, priority: 'Routine', status: 'Dispatched', time: '2 hrs ago' },
]

const sectionStatuses: Record<string, string[]> = {
  'New Requests': ['New'],
  'Pending Requests': ['Pending'],
  'Approved Requests': ['Approved'],
  'Rejected Requests': ['Rejected'],
  'Allocate Blood Units': ['Approved', 'Allocated'],
  'Dispatch Management': ['Allocated', 'Dispatched'],
  'Request Fulfilment History': ['Dispatched', 'Fulfilled'],
}

export default function BloodRequestManagementView({ activeSection, profileName, onNavigate }: { activeSection: string; profileName: string; onNavigate: (label: string) => void }) {
  const [search, setSearch] = useState('')
  const selected = sections.find((section) => section.label === activeSection)
  const visibleRequests = useMemo(() => requests.filter((request) => {
    const matchesSearch = `${request.id} ${request.hospital} ${request.group} ${request.component}`.toLowerCase().includes(search.toLowerCase())
    const statuses = sectionStatuses[activeSection]
    return matchesSearch && (!statuses || statuses.includes(request.status))
  }), [activeSection, search])
  const heading = selected?.label ?? 'Blood Request Management'
  const HeadingIcon = selected?.icon ?? CalendarDays

  return (
    <section className="pulse-overview request-dashboard" aria-labelledby="blood-request-dashboard-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD BANK OPERATIONS</p>
          <h1 id="blood-request-dashboard-title">Blood Request Management</h1>
          <p className="pulse-intro">A single workspace to review, approve, allocate, and fulfil hospital requests.</p>
        </div>
        <span className="pulse-ai-chip"><HeadingIcon aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="request-dashboard-stats" aria-label="Request summary">
        <article><span>Open requests</span><strong>36</strong><small><ArrowUpRight aria-hidden="true" /> 8 urgent need review</small></article>
        <article><span>Pending review</span><strong>11</strong><small><Clock3 aria-hidden="true" /> 4 awaiting stock check</small></article>
        <article><span>Fulfilled today</span><strong>19</strong><small><ArrowUpRight aria-hidden="true" /> 12% vs. yesterday</small></article>
        <article><span>Average fulfilment</span><strong>3.2h</strong><small><ArrowDownRight aria-hidden="true" /> 18 min faster this week</small></article>
      </div>

      <section className="pulse-panel request-workspace-panel" aria-label="Request management sections">
        <div className="request-section-heading"><div><p className="pulse-kicker">WORK QUEUES</p><h2>{heading}</h2><p>{selected?.detail ?? 'Choose a work queue to see requests at that stage.'}</p></div><span className="request-queue-count">{selected?.count ?? 36} <small>items</small></span></div>
        <div className="request-queue-grid">
          {sections.map(({ label, icon: Icon, count }) => <button type="button" key={label} className={`request-queue-card ${activeSection === label ? 'selected' : ''}`} onClick={() => onNavigate(label)} aria-pressed={activeSection === label}>
            <span className="request-queue-icon"><Icon aria-hidden="true" /></span><span className="request-queue-copy"><strong>{label}</strong><small>{count} requests</small></span><ChevronRight aria-hidden="true" />
          </button>)}
        </div>
      </section>

      <section className="pulse-panel request-table-panel" aria-labelledby="request-table-title">
        <div className="request-table-heading"><div><p className="pulse-kicker">REQUESTS</p><h2 id="request-table-title">{heading}</h2><p>Sample activity for dashboard preview; verify decisions with your transfusion service.</p></div><label className="request-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" aria-label="Search requests" /></label></div>
        <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Request</th><th>Blood product</th><th>Units</th><th>Priority</th><th>Status</th><th>Received</th><th><span className="sr-only">Open request</span></th></tr></thead><tbody>
          {visibleRequests.length ? visibleRequests.map((request) => <tr key={request.id}><td><strong>{request.id}</strong><small>{request.hospital}</small></td><td><span className="request-blood-group">{request.group}</span>{request.component}</td><td>{request.units}</td><td><span className={`request-priority ${request.priority.toLowerCase()}`}>{request.priority}</span></td><td><span className={`request-status ${request.status.toLowerCase()}`}>{request.status}</span></td><td>{request.time}</td><td><button type="button" className="request-open-button" aria-label={`Open request ${request.id}`} onClick={() => onNavigate(request.status === 'New' ? 'New Requests' : request.status === 'Pending' ? 'Pending Requests' : request.status === 'Approved' ? 'Allocate Blood Units' : 'Dispatch Management')}><ChevronRight aria-hidden="true" /></button></td></tr>) : <tr><td className="request-empty" colSpan={7}>No requests match this queue and search.</td></tr>}
        </tbody></table></div>
        <div className="request-dashboard-footnote"><span>Showing {visibleRequests.length} sample requests</span><span>Last updated just now</span></div>
      </section>
    </section>
  )
}
