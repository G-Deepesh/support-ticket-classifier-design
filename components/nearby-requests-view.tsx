'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, BellRing, CheckCircle2, Clock3, Droplets, MapPin, ShieldCheck } from 'lucide-react'

type NearbyRequest = {
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
const locations = ['All locations', 'Downtown', 'Riverside', 'Northside', 'West End']
type RequestView = 'all' | 'emergency' | 'accepted'
type Availability = 'available' | 'unavailable'

export default function NearbyRequestsView({ profileName }: { profileName: string }) {
  const [requestView, setRequestView] = useState<RequestView>('all')
  const [bloodGroup, setBloodGroup] = useState('All blood groups')
  const [location, setLocation] = useState('All locations')
  const [acceptedIds, setAcceptedIds] = useState<string[]>([])
  const [availability, setAvailability] = useState<Availability>('unavailable')

  const visibleRequests = useMemo(() => sampleRequests.filter((request) => {
    const matchesBloodGroup = bloodGroup === 'All blood groups' || request.bloodGroup === bloodGroup
    const matchesLocation = location === 'All locations' || request.location === location
    const matchesView = requestView === 'all'
      || (requestView === 'emergency' && request.urgency === 'Emergency')
      || (requestView === 'accepted' && acceptedIds.includes(request.id))
    return matchesBloodGroup && matchesLocation && matchesView
  }), [acceptedIds, bloodGroup, location, requestView])

  const acceptRequest = (requestId: string) => {
    setAcceptedIds((current) => current.includes(requestId) ? current : [...current, requestId])
  }

  return (
    <section className="pulse-overview nearby-requests-view" aria-labelledby="nearby-requests-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> DONOR SERVICES · LOCAL REQUESTS</p>
          <h1 id="nearby-requests-title">Nearby Blood Requests &amp; Availability</h1>
          <p className="pulse-intro">Browse example requests by blood group, urgency, and location. Contact a donation center to confirm any real need.</p>
        </div>
        <span className="pulse-ai-chip"><ShieldCheck aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Requests and responses are illustrative. This demo does not contact centers or save availability.</div>

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
          <button type="button" className={requestView === 'accepted' ? 'active' : ''} aria-pressed={requestView === 'accepted'} onClick={() => setRequestView('accepted')}>Accepted Requests <span>{acceptedIds.length}</span></button>
        </div>
      </section>

      <section className="nearby-request-results" aria-labelledby="request-details-title">
        <div className="pulse-section-heading nearby-request-results-heading">
          <div><p className="pulse-kicker">REQUESTS · DEMO</p><h2 id="request-details-title">Request Details</h2><p aria-live="polite">{visibleRequests.length} {visibleRequests.length === 1 ? 'request' : 'requests'} shown</p></div>
        </div>
        {visibleRequests.length > 0 ? (
          <div className="nearby-request-list">
            {visibleRequests.map((request) => {
              const hasResponded = acceptedIds.includes(request.id)
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
                  <div className="nearby-request-status"><span>Request Status</span><strong className={hasResponded ? 'responded' : ''}>{hasResponded ? 'Response noted (demo)' : 'Open · demo request'}</strong></div>
                  <button className="pulse-primary-link nearby-respond-button" type="button" disabled={hasResponded} onClick={() => acceptRequest(request.id)}>
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
            <button type="button" aria-pressed={availability === 'available'} className={availability === 'available' ? 'selected' : ''} onClick={() => setAvailability('available')}>Available</button>
            <button type="button" aria-pressed={availability === 'unavailable'} className={availability === 'unavailable' ? 'selected' : ''} onClick={() => setAvailability('unavailable')}>Unavailable</button>
          </div>
        </fieldset>
        <div className="pulse-match-callout"><BellRing aria-hidden="true" /><span><strong>Demo status only</strong><small>Your selection stays in this preview and is not sent to a donation center or saved to an account.</small></span></div>
      </section>
    </section>
  )
}
