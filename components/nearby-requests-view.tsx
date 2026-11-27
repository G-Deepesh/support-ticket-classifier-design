'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { AlertTriangle, BellRing, CheckCircle2, Clock3, Droplets, MapPin, ShieldCheck } from 'lucide-react'
import { getOpenRequestsForDonors, respondToHospitalRequest } from '@/app/actions/donor-requests'

function formatRelative(iso: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} d ago`
}

type NearbyRequest = {
  live?: boolean
  liveId?: string
  id: string
  bloodGroup: string
  units: number
  location: string
  distance: string
  requested: string
  urgency: 'Emergency' | 'Urgent' | 'Standard'
}

const sampleRequests: NearbyRequest[] = [
  { id: 'DEMO-104', bloodGroup: 'O−', units: 2, location: 'Downtown', distance: '2.4 mi', requested: '32 min ago', urgency: 'Emergency' },
  { id: 'DEMO-108', bloodGroup: 'A−', units: 1, location: 'Riverside', distance: '4.1 mi', requested: '1 hr ago', urgency: 'Urgent' },
  { id: 'DEMO-112', bloodGroup: 'B+', units: 3, location: 'Northside', distance: '5.6 mi', requested: '2 hrs ago', urgency: 'Standard' },
  { id: 'DEMO-116', bloodGroup: 'AB−', units: 2, location: 'West End', distance: '7.8 mi', requested: '18 min ago', urgency: 'Emergency' },
]

const bloodGroups = ['All blood groups', 'O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+']
const locations = ['All locations', 'Hospital network', 'Downtown', 'Riverside', 'Northside', 'West End']
type RequestView = 'all' | 'emergency' | 'accepted'
type Availability = 'available' | 'unavailable'

export default function NearbyRequestsView({ profileName }: { profileName: string }) {
  const [requestView, setRequestView] = useState<RequestView>('all')
  const [bloodGroup, setBloodGroup] = useState('All blood groups')
  const [location, setLocation] = useState('All locations')
  const [acceptedIds, setAcceptedIds] = useState<string[]>([])
  const [availability, setAvailability] = useState<Availability>('unavailable')
  const [availabilityMessage, setAvailabilityMessage] = useState('Availability is set to Unavailable in this preview.')

  const [respondError, setRespondError] = useState('')
  const { data: liveData, mutate: refreshLive } = useSWR('open-requests-for-donors', getOpenRequestsForDonors, { refreshInterval: 15000 })

  const liveRequests = useMemo<NearbyRequest[]>(() => (liveData ?? []).map((request) => ({
    live: true,
    liveId: request.id,
    id: `HR-${request.id.slice(0, 8).toUpperCase()}`,
    bloodGroup: request.bloodGroup,
    units: request.requiredUnits,
    location: 'Hospital network',
    distance: request.bloodComponent,
    requested: formatRelative(request.createdAt),
    urgency: request.priority === 'Emergency' ? 'Emergency' : request.priority === 'Urgent' ? 'Urgent' : 'Standard',
  })), [liveData])

  const respondedLiveIds = useMemo(
    () => (liveData ?? []).filter((request) => request.hasResponded).map((request) => `HR-${request.id.slice(0, 8).toUpperCase()}`),
    [liveData],
  )
  const respondedIds = useMemo(() => [...acceptedIds, ...respondedLiveIds], [acceptedIds, respondedLiveIds])

  const visibleRequests = useMemo(() => [...liveRequests, ...sampleRequests].filter((request) => {
    const matchesBloodGroup = bloodGroup === 'All blood groups' || request.bloodGroup === bloodGroup
    const matchesLocation = location === 'All locations' || request.location === location
    const matchesView = requestView === 'all'
      || (requestView === 'emergency' && request.urgency === 'Emergency')
      || (requestView === 'accepted' && respondedIds.includes(request.id))
    return matchesBloodGroup && matchesLocation && matchesView
  }), [liveRequests, respondedIds, bloodGroup, location, requestView])

  const acceptRequest = async (request: NearbyRequest) => {
    setRespondError('')
    if (request.live && request.liveId) {
      const result = await respondToHospitalRequest(request.liveId)
      if (!result.ok) {
        setRespondError(result.message)
        return
      }
      await refreshLive()
      return
    }
    setAcceptedIds((current) => current.includes(request.id) ? current : [...current, request.id])
  }

  const updateAvailability = (nextAvailability: Availability) => {
    setAvailability(nextAvailability)
    setAvailabilityMessage(`Availability set to ${nextAvailability === 'available' ? 'Available' : 'Unavailable'} in this preview.`)
  }

  return (
    <section className="pulse-overview nearby-requests-view" aria-labelledby="nearby-requests-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> DONOR SERVICES · LOCAL REQUESTS</p>
          <h1 id="nearby-requests-title">Nearby Blood Requests &amp; Availability</h1>
          <p className="pulse-intro">Browse live hospital requests and sample requests by blood group, urgency, and location. Contact a donation center to confirm any real need.</p>
        </div>
        <span className="pulse-ai-chip"><ShieldCheck aria-hidden="true" /> {profileName}</span>
      </header>

      <section className="nearby-request-filter-panel" aria-label="Filter nearby requests">
        <div className="nearby-request-controls">
          <label className="nearby-request-control">
            <span>Requests by Blood Group</span>
            <select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}>
              {bloodGroups.map((group) => <option key={group}>{group}</option>)}
            </select>
          </label>
          <label className="nearby-request-control">
            <span>Requests by Location</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              {locations.map((place) => <option key={place}>{place}</option>)}
            </select>
          </label>
        </div>
        <div className="nearby-request-tabs" role="group" aria-label="Request list">
          <button type="button" className={requestView === 'all' ? 'active' : ''} aria-pressed={requestView === 'all'} onClick={() => setRequestView('all')}>All Nearby Requests</button>
          <button type="button" className={requestView === 'emergency' ? 'active' : ''} aria-pressed={requestView === 'emergency'} onClick={() => setRequestView('emergency')}><AlertTriangle aria-hidden="true" /> Emergency Requests</button>
          <button type="button" className={requestView === 'accepted' ? 'active' : ''} aria-pressed={requestView === 'accepted'} onClick={() => setRequestView('accepted')}>Accepted Requests <span>{respondedIds.length}</span></button>
        </div>
      </section>

      <section className="nearby-request-results" aria-labelledby="request-details-title">
        <div className="pulse-section-heading nearby-request-results-heading">
          <div><p className="pulse-kicker">REQUESTS · {liveRequests.length} LIVE FROM HOSPITALS</p><h2 id="request-details-title">Request Details</h2><p aria-live="polite">{visibleRequests.length} {visibleRequests.length === 1 ? 'request' : 'requests'} shown</p></div>
        </div>
        {respondError && <p className="nearby-availability-feedback" role="alert">{respondError}</p>}
        {visibleRequests.length > 0 ? (
          <div className="nearby-request-list">
            {visibleRequests.map((request) => {
              const hasResponded = respondedIds.includes(request.id)
              return (
                <article className="nearby-request-card" key={request.id}>
                  <div className="nearby-request-card-header">
                    <span className="nearby-request-id">{request.id}</span>
                    <span className={`nearby-urgency-badge ${request.urgency.toLowerCase()}`}>
                      {request.urgency === 'Emergency' && <AlertTriangle aria-hidden="true" />}
                      {request.urgency}
                    </span>
                  </div>
                  <div className="nearby-request-blood"><span className="nearby-request-blood-icon"><Droplets aria-hidden="true" /></span><strong>{request.bloodGroup}</strong><span>{request.units} units requested</span></div>
                  <div className="nearby-request-meta"><span><MapPin aria-hidden="true" /> {request.location} · {request.distance}</span><span><Clock3 aria-hidden="true" /> {request.requested}</span></div>
                  <div className="nearby-request-status"><span>Request Status</span><strong className={hasResponded ? 'responded' : ''}>{request.live ? (hasResponded ? 'Response sent to hospital' : 'Open · live hospital request') : (hasResponded ? 'Response noted (demo)' : 'Open · demo request')}</strong></div>
                  <button className="pulse-primary-link nearby-respond-button" type="button" disabled={hasResponded} onClick={() => acceptRequest(request)}>
                    {hasResponded ? <><CheckCircle2 aria-hidden="true" /> Response noted</> : 'Respond to Request'}
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="nearby-request-empty" role="status">
            {requestView === 'accepted' ? 'No requests have been accepted in this demo yet.' : 'No requests match these filters. Try another blood group or location.'}
          </div>
        )}
      </section>

      <section className="pulse-panel nearby-request-status-panel" aria-labelledby="nearby-request-status-title">
        <div className="pulse-section-heading">
          <div><p className="pulse-kicker">YOUR RESPONSE SETTINGS</p><h2 id="nearby-request-status-title">Request Status &amp; Availability</h2><p>{acceptedIds.length} accepted {acceptedIds.length === 1 ? 'request' : 'requests'} in this demo.</p></div>
          <span className={`nearby-availability-badge ${availability}`}><span aria-hidden="true" /> {availability === 'available' ? 'Available' : 'Unavailable'}</span>
        </div>
        <fieldset className="nearby-availability-fieldset">
          <legend>Available/Unavailable status</legend>
          <div className="nearby-availability-options">
            <button type="button" aria-pressed={availability === 'available'} className={availability === 'available' ? 'selected' : ''} onClick={() => updateAvailability('available')}>Available</button>
            <button type="button" aria-pressed={availability === 'unavailable'} className={availability === 'unavailable' ? 'selected' : ''} onClick={() => updateAvailability('unavailable')}>Unavailable</button>
          </div>
        </fieldset>
        <p className="nearby-availability-feedback" role="status" aria-live="polite">{availabilityMessage}</p>
        <div className="pulse-match-callout"><BellRing aria-hidden="true" /><span><strong>Demo status only</strong><small>Your selection stays in this preview and is not sent to a donation center or saved to an account.</small></span></div>
      </section>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Requests labelled HR- are live hospital requests and your responses are shared with the hospital. DEMO- requests are illustrative, and availability is not saved.</div>
    </section>
  )
}
