'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { ArrowUpRight, CalendarDays, Check, ChevronRight, Clock3, Droplets, Inbox, ListTodo, LoaderCircle, Search, Truck, X } from 'lucide-react'
import { getHospitalDeliveryRequests, updateHospitalDeliveryStatus } from '@/app/actions/hospital-delivery-tracking'
import { DELIVERY_STATUSES, type DeliveryStatus } from '@/lib/hospital-delivery-statuses'

const sections = [
  { label: 'All Incoming Requests', icon: Inbox, detail: 'Review every request submitted by the hospital workspace.' },
  { label: 'New Requests', icon: ListTodo, detail: 'Triage requests submitted by the hospital team.' },
  { label: 'Pending Requests', icon: Clock3, detail: 'Follow up on requests awaiting review or stock.' },
  { label: 'Approved Requests', icon: Check, detail: 'Prepare approved requests for allocation.' },
  { label: 'Cancelled Requests', icon: X, detail: 'Review cancelled requests.' },
  { label: 'Allocate Blood Units', icon: Droplets, detail: 'Coordinate allocation for approved requests.' },
  { label: 'Dispatch Management', icon: Truck, detail: 'Coordinate dispatch and delivery status.' },
  { label: 'Request Fulfilment History', icon: CalendarDays, detail: 'Review received and completed requests.' },
] as const

type QueueLabel = (typeof sections)[number]['label']
type Request = Awaited<ReturnType<typeof getHospitalDeliveryRequests>>[number]

function matchesQueue(request: Request, queue: QueueLabel) {
  if (queue === 'All Incoming Requests') return true
  if (queue === 'New Requests') return request.requestStatus === 'Submitted'
  if (queue === 'Pending Requests') return request.deliveryStatus === 'Pending'
  if (queue === 'Approved Requests') return request.deliveryStatus === 'Approved'
  if (queue === 'Cancelled Requests') return request.deliveryStatus === 'Cancelled'
  if (queue === 'Allocate Blood Units') return ['Approved', 'Allocated'].includes(request.deliveryStatus)
  if (queue === 'Dispatch Management') return ['Allocated', 'Dispatched'].includes(request.deliveryStatus)
  return ['Received', 'Completed'].includes(request.deliveryStatus)
}

export default function BloodRequestManagementView({ profileName }: { profileName: string }) {
  const { data: requests, error, isLoading, mutate } = useSWR('hospital-delivery-requests', getHospitalDeliveryRequests)
  const [search, setSearch] = useState('')
  const [activeQueue, setActiveQueue] = useState<QueueLabel>('All Incoming Requests')
  const [savingRequestId, setSavingRequestId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const selected = sections.find((section) => section.label === activeQueue) ?? sections[0]
  const visibleRequests = useMemo(() => (requests ?? []).filter((request) => {
    const matchesSearch = `${request.id} ${request.bloodGroup} ${request.bloodComponent}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && matchesQueue(request, activeQueue)
  }), [activeQueue, requests, search])
  const queueCounts = useMemo(() => Object.fromEntries(sections.map(({ label }) => [label, (requests ?? []).filter((request) => matchesQueue(request, label)).length])) as Record<QueueLabel, number>, [requests])
  const activeCount = (requests ?? []).filter((request) => !['Completed', 'Cancelled'].includes(request.deliveryStatus)).length
  const pendingCount = (requests ?? []).filter((request) => request.deliveryStatus === 'Pending').length
  const fulfilledCount = (requests ?? []).filter((request) => ['Received', 'Completed'].includes(request.deliveryStatus)).length
  const heading = selected.label
  const HeadingIcon = selected.icon

  async function saveStatus(request: Request, status: DeliveryStatus) {
    setSavingRequestId(request.id)
    setFeedback('')
    try {
      const result = await updateHospitalDeliveryStatus(request.id, status)
      if (!result.ok) {
        setFeedback(result.message)
        return
      }
      setFeedback(`Request HR-${request.id.slice(0, 8).toUpperCase()} updated to ${status}.`)
      await mutate()
    } catch {
      setFeedback('We could not update this request. Please try again.')
    } finally {
      setSavingRequestId(null)
    }
  }

  return (
    <section className="pulse-overview request-dashboard" aria-labelledby="blood-request-dashboard-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD BANK OPERATIONS</p>
          <h1 id="blood-request-dashboard-title">Blood Request Management</h1>
          <p className="pulse-intro">Review hospital requests and update the shared delivery workflow.</p>
        </div>
        <span className="pulse-ai-chip"><HeadingIcon aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="request-dashboard-stats" aria-label="Request summary">
        <article><span>Active requests</span><strong>{activeCount}</strong><small><ArrowUpRight aria-hidden="true" /> Submitted by hospitals</small></article>
        <article><span>Pending review</span><strong>{pendingCount}</strong><small><Clock3 aria-hidden="true" /> Awaiting a decision</small></article>
        <article><span>Fulfilled</span><strong>{fulfilledCount}</strong><small><Check aria-hidden="true" /> Received or completed</small></article>
        <article><span>All queues</span><strong>{sections.length}</strong><small><Inbox aria-hidden="true" /> Shared request pipeline</small></article>
      </div>

      <section className="pulse-panel request-workspace-panel" aria-label="Request management sections">
        <div className="request-section-heading"><div><p className="pulse-kicker">WORK QUEUES</p><h2>{heading}</h2><p>{selected.detail}</p></div><span className="request-queue-count">{queueCounts[activeQueue] ?? 0} <small>requests</small></span></div>
        <div className="request-queue-grid">
          {sections.map(({ label, icon: Icon }) => <button type="button" key={label} className={`request-queue-card ${activeQueue === label ? 'selected' : ''}`} onClick={() => setActiveQueue(label)} aria-pressed={activeQueue === label}>
            <span className="request-queue-icon"><Icon aria-hidden="true" /></span><span className="request-queue-copy"><strong>{label}</strong><small>{queueCounts[label] ?? 0} requests</small></span><ChevronRight aria-hidden="true" />
          </button>)}
        </div>
      </section>

      <section className="pulse-panel request-table-panel" aria-labelledby="request-table-title">
        <div className="request-table-heading"><div><p className="pulse-kicker">LIVE HOSPITAL REQUESTS</p><h2 id="request-table-title">{heading}</h2><p>Updates here are shared with Hospital delivery tracking.</p></div><label className="request-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" aria-label="Search requests" /></label></div>
        {feedback && <p className="delivery-feedback" role="status" aria-live="polite">{feedback}</p>}
        <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Request</th><th>Blood product</th><th>Units</th><th>Priority</th><th>Status</th><th>Required by</th><th>Update status</th></tr></thead><tbody>
          {error ? <tr><td className="request-empty" colSpan={7}>Could not load hospital requests. <button type="button" onClick={() => void mutate()}>Retry</button></td></tr> : isLoading ? <tr><td className="request-empty" colSpan={7}><LoaderCircle aria-hidden="true" /> Loading hospital requests…</td></tr> : visibleRequests.length ? visibleRequests.map((request) => <tr key={request.id}><td><strong>HR-{request.id.slice(0, 8).toUpperCase()}</strong><small>Hospital workspace</small></td><td><span className="request-blood-group">{request.bloodGroup}</span>{request.bloodComponent}</td><td>{request.requiredUnits}</td><td><span className={`request-priority ${request.priority.toLowerCase()}`}>{request.priority}</span></td><td><span className={`request-status ${request.deliveryStatus.toLowerCase()}`}>{request.deliveryStatus}</span></td><td>{new Date(request.requiredAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td><td><label className="sr-only" htmlFor={`bank-status-${request.id}`}>Status for request HR-{request.id.slice(0, 8).toUpperCase()}</label><select id={`bank-status-${request.id}`} value={request.deliveryStatus} disabled={savingRequestId === request.id} onChange={(event) => void saveStatus(request, event.target.value as DeliveryStatus)}>{DELIVERY_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>) : <tr><td className="request-empty" colSpan={7}>No hospital requests match this queue and search.</td></tr>}
        </tbody></table></div>
        <div className="request-dashboard-footnote"><span>Showing {visibleRequests.length} live requests</span><button type="button" className="request-open-button" onClick={() => void mutate()}>Refresh</button></div>
      </section>
    </section>
  )
}
