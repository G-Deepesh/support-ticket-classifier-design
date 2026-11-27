'use client'

import { useMemo, useState, type FormEvent } from 'react'
import useSWR from 'swr'
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, PackageCheck, Plus, RefreshCw, Truck, X } from 'lucide-react'
import { createHospitalBloodRequest } from '@/app/actions/hospital-blood-request'
import { getHospitalDeliveryRequests, updateHospitalDeliveryStatus } from '@/app/actions/hospital-delivery-tracking'
import { BLOOD_COMPONENTS, BLOOD_GROUPS, REQUEST_PRIORITIES } from '@/lib/hospital-blood-request-options'
import { DELIVERY_STATUSES, type DeliveryStatus } from '@/lib/hospital-delivery-statuses'

type DeliveryRequest = Awaited<ReturnType<typeof getHospitalDeliveryRequests>>[number]

type FilterTab = { label: string; status: DeliveryStatus | 'All Requests' }

const FILTER_TABS: FilterTab[] = [
  { label: 'All Requests', status: 'All Requests' },
  ...DELIVERY_STATUSES.map((status) => ({ label: `${status} Requests`, status })),
]

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function statusClass(status: DeliveryStatus) {
  return `delivery-status delivery-status-${status.toLowerCase()}`
}

export default function HospitalDeliveryTrackingView({ hospitalName }: { hospitalName: string }) {
  const { data: requests, error, isLoading, mutate } = useSWR('hospital-delivery-requests', getHospitalDeliveryRequests)
  const [activeFilter, setActiveFilter] = useState<FilterTab['status']>('All Requests')
  const [draftStatuses, setDraftStatuses] = useState<Record<string, DeliveryStatus>>({})
  const [savingRequestId, setSavingRequestId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)

  const counts = useMemo(() => {
    const items = requests ?? []
    return Object.fromEntries([
      ['All Requests', items.length],
      ...DELIVERY_STATUSES.map((status) => [status, items.filter((request) => request.deliveryStatus === status).length]),
    ]) as Record<FilterTab['status'], number>
  }, [requests])

  const visibleRequests = useMemo(() => {
    const items = requests ?? []
    return activeFilter === 'All Requests'
      ? items
      : items.filter((request) => request.deliveryStatus === activeFilter)
  }, [activeFilter, requests])

  async function submitNewRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const requiredAt = new Date(String(formData.get('requiredAt') ?? ''))
    if (Number.isNaN(requiredAt.getTime()) || requiredAt.getTime() <= Date.now()) {
      setFeedback('Choose a required date and time in the future.')
      return
    }

    formData.set('requiredAt', requiredAt.toISOString())
    setIsSubmittingRequest(true)
    setFeedback('')
    try {
      const result = await createHospitalBloodRequest(formData)
      if (!result.ok) {
        setFeedback(result.message)
        return
      }
      form.reset()
      setIsCreating(false)
      setActiveFilter('All Requests')
      setFeedback(`Request HR-${result.request.id.slice(0, 8).toUpperCase()} created successfully.`)
      await mutate()
    } catch {
      setFeedback('We could not save your request. Please try again.')
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  async function saveStatus(request: DeliveryRequest) {
    const status = draftStatuses[request.id] ?? request.deliveryStatus
    if (status === request.deliveryStatus) return

    setSavingRequestId(request.id)
    setFeedback('')
    let result
    try {
      result = await updateHospitalDeliveryStatus(request.id, status)
    } catch {
      setSavingRequestId(null)
      setFeedback('We could not update this delivery status. Please try again.')
      return
    }
    setSavingRequestId(null)

    if (!result.ok) {
      setFeedback(result.message)
      return
    }

    setDraftStatuses((current) => {
      const next = { ...current }
      delete next[request.id]
      return next
    })
    setFeedback(`Request HR-${request.id.slice(0, 8).toUpperCase()} updated to ${status}.`)
    await mutate()
  }

  return (
    <section className="pulse-overview delivery-tracking-view" aria-labelledby="delivery-tracking-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> HOSPITAL WORKSPACE</p>
          <h1 id="delivery-tracking-title">Delivery Request tracking</h1>
          <p className="pulse-intro">Track blood requests from approval through delivery and completion.</p>
        </div>
        <div className="delivery-heading-actions">
          <span className="pulse-ai-chip"><Truck aria-hidden="true" /> {hospitalName}</span>
          <button className="delivery-create-button" type="button" aria-expanded={isCreating} aria-controls="delivery-create-request" onClick={() => { setIsCreating((open) => !open); setFeedback('') }}>
            {isCreating ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isCreating ? 'Close form' : 'New request'}
          </button>
        </div>
      </header>

      <section className="pulse-panel delivery-tracking-panel" aria-label="Delivery request status views">
        {isCreating && (
          <form id="delivery-create-request" className="delivery-create-form" onSubmit={submitNewRequest} aria-busy={isSubmittingRequest}>
            <div className="delivery-create-form-heading">
              <div><p className="pulse-kicker">NEW REQUEST</p><h2>Create a blood request</h2><p>Enter the product, quantity, timing, and urgency.</p></div>
            </div>
            <div className="delivery-create-fields">
              <label>Blood group<select name="bloodGroup" defaultValue="" required><option value="" disabled>Select blood group</option>{BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
              <label>Blood component<select name="bloodComponent" defaultValue="" required><option value="" disabled>Select component</option>{BLOOD_COMPONENTS.map((component) => <option key={component} value={component}>{component}</option>)}</select></label>
              <label>Required units<input name="requiredUnits" type="number" min="1" max="10000" step="1" placeholder="e.g. 4" required /></label>
              <label>Required by<input name="requiredAt" type="datetime-local" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)} required /></label>
              <label>Priority<select name="priority" defaultValue="" required><option value="" disabled>Select priority</option>{REQUEST_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
              <div className="delivery-create-submit"><button type="submit" disabled={isSubmittingRequest}>{isSubmittingRequest ? <LoaderCircle className="delivery-spinner" aria-hidden="true" /> : <Plus aria-hidden="true" />}{isSubmittingRequest ? 'Creating…' : 'Create request'}</button></div>
            </div>
            <p className="delivery-create-note">Do not include patient identifiers in this request.</p>
          </form>
        )}
        <div className="delivery-tabs" role="tablist" aria-label="Filter requests by delivery status">
          {FILTER_TABS.map((tab) => {
            const selected = activeFilter === tab.status
            return (
              <button
                key={tab.status}
                className={`delivery-tab${selected ? ' active' : ''}`}
                id={`delivery-tab-${tab.status.toLowerCase().replaceAll(' ', '-')}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="delivery-request-list"
                onClick={() => setActiveFilter(tab.status)}
              >
                <span>{tab.label}</span>
                <span className="delivery-tab-count">{counts[tab.status] ?? 0}</span>
              </button>
            )
          })}
        </div>

        <div className="delivery-list-heading">
          <div>
            <p className="pulse-kicker">REQUEST PIPELINE</p>
            <h2>{activeFilter}</h2>
            <p>{visibleRequests.length} {visibleRequests.length === 1 ? 'request' : 'requests'} in this view</p>
          </div>
          <span className="delivery-total"><PackageCheck aria-hidden="true" /> {requests?.length ?? 0} total</span>
        </div>

        {feedback && <p className="delivery-feedback" role="status" aria-live="polite">{feedback}</p>}

        <div id="delivery-request-list" role="tabpanel" aria-labelledby={`delivery-tab-${activeFilter.toLowerCase().replaceAll(' ', '-')}`}>
          {error ? (
            <div className="delivery-state delivery-error" role="alert">
              <AlertCircle aria-hidden="true" />
              <div><strong>Could not load delivery requests</strong><p>Try refreshing the list. Your existing request data has not been changed.</p></div>
              <button className="delivery-refresh" type="button" onClick={() => void mutate()}><RefreshCw aria-hidden="true" /> Retry</button>
            </div>
          ) : isLoading ? (
            <div className="delivery-state" role="status"><LoaderCircle className="delivery-spinner" aria-hidden="true" /> Loading delivery requests…</div>
          ) : visibleRequests.length === 0 ? (
            <div className="delivery-empty" role="status">
              <span><PackageCheck aria-hidden="true" /></span>
              <strong>{requests?.length ? `No ${activeFilter.toLowerCase()} yet` : 'No blood requests yet'}</strong>
              <p>{requests?.length ? 'Requests will appear here when their delivery status matches this view.' : 'Create a blood request first; it will appear here with Pending delivery status.'}</p>
            </div>
          ) : (
            <div className="delivery-request-list">
            {visibleRequests.map((request) => {
              const selectedStatus = draftStatuses[request.id] ?? request.deliveryStatus
              const isSaving = savingRequestId === request.id
              return (
                <article className="delivery-request-card" key={request.id}>
                  <div className="delivery-request-main">
                    <div className="delivery-request-ref">
                      <span className="delivery-request-icon"><PackageCheck aria-hidden="true" /></span>
                      <div><strong>HR-{request.id.slice(0, 8).toUpperCase()}</strong><span>{request.bloodGroup} · {request.bloodComponent}</span></div>
                    </div>
                    <span className={statusClass(request.deliveryStatus)}>{request.deliveryStatus}</span>
                  </div>

                  <dl className="delivery-request-meta">
                    <div><dt>Units</dt><dd>{request.requiredUnits}</dd></div>
                    <div><dt>Priority</dt><dd><span className={`delivery-priority delivery-priority-${request.priority.toLowerCase()}`}>{request.priority}</span></dd></div>
                    <div><dt>Required by</dt><dd><time dateTime={request.requiredAt}>{formatDate(request.requiredAt)}</time></dd></div>
                    <div><dt>Donor responses</dt><dd>{request.donorResponses === 0 ? 'None yet' : `${request.donorResponses} ${request.donorResponses === 1 ? 'donor' : 'donors'} responded`}</dd></div>
                  </dl>

                  <form
                    className="delivery-status-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void saveStatus(request)
                    }}
                    aria-label={`Update delivery status for request HR-${request.id.slice(0, 8).toUpperCase()}`}
                  >
                    <label htmlFor={`delivery-status-${request.id}`}>Delivery status</label>
                    <select
                      id={`delivery-status-${request.id}`}
                      value={selectedStatus}
                      onChange={(event) => setDraftStatuses((current) => ({ ...current, [request.id]: event.target.value as DeliveryStatus }))}
                    >
                      {DELIVERY_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <button type="submit" disabled={isSaving || selectedStatus === request.deliveryStatus}>
                      {isSaving ? <LoaderCircle className="delivery-spinner" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
                      {isSaving ? 'Saving…' : 'Update status'}
                    </button>
                  </form>

                  <p className="delivery-request-date"><Clock3 aria-hidden="true" /> Submitted {formatDate(request.createdAt)}{request.deliveryUpdatedAt ? ` · Delivery updated ${formatDate(request.deliveryUpdatedAt)}` : ''}</p>
                </article>
              )
            })}
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
