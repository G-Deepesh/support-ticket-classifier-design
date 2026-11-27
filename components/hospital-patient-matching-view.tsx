'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Activity, BellRing, Building2, CheckCircle2, Clock3, History, LoaderCircle, MapPin, RefreshCw, TriangleAlert, Users } from 'lucide-react'
import { getHospitalMatchingDashboardData, updateHospitalAlertPreference, type HospitalAlertType } from '@/app/actions/hospital-patient-matching'

const alertOptions: { type: HospitalAlertType; title: string; description: string; icon: typeof Users }[] = [
  {
    type: 'nearby_donors',
    title: 'Nearby Donor Notifications',
    description: 'Save your preference for alerts when compatible nearby donor matches are available.',
    icon: Users,
  },
  {
    type: 'nearby_blood_banks',
    title: 'Nearby Blood Bank Notifications',
    description: 'Save your preference for alerts when nearby blood bank availability is shared.',
    icon: Building2,
  },
]

const closedStatuses = new Set(['fulfilled', 'completed', 'cancelled', 'canceled', 'closed'])

function requestReference(id: string) {
  return `HR-${id.slice(0, 8).toUpperCase()}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export default function HospitalPatientMatchingView({ hospitalName }: { hospitalName: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR('hospital-patient-matching-dashboard', getHospitalMatchingDashboardData)
  const [savingType, setSavingType] = useState<HospitalAlertType | null>(null)
  const [preferenceMessage, setPreferenceMessage] = useState('')
  const requests = data?.requests ?? []
  const emergencyRequests = requests.filter((request) => request.priority === 'Emergency')
  const activeEmergencyRequests = emergencyRequests.filter((request) => !closedStatuses.has(request.status.toLowerCase()))

  async function handleAlertToggle(type: HospitalAlertType, enabled: boolean) {
    setSavingType(type)
    setPreferenceMessage('')

    try {
      const result = await updateHospitalAlertPreference(type, enabled)
      if (!result.ok) throw new Error(result.message)
      await mutate()
      setPreferenceMessage('Notification preference saved.')
    } catch {
      setPreferenceMessage('We could not save this preference. Please try again.')
    } finally {
      setSavingType(null)
    }
  }

  return (
    <section className="pulse-overview hospital-matching-view" aria-labelledby="hospital-matching-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> HOSPITAL WORKSPACE</p>
          <h1 id="hospital-matching-title">Patient matching</h1>
          <p className="pulse-intro">Manage nearby match alerts and follow your emergency blood requests.</p>
        </div>
        <div className="hospital-matching-header-actions">
          <button className="hospital-matching-refresh" type="button" onClick={() => void mutate()} disabled={isValidating}>
            <RefreshCw aria-hidden="true" /> {isValidating ? 'Refreshing…' : 'Refresh data'}
          </button>
          <span className="pulse-ai-chip"><Activity aria-hidden="true" /> {hospitalName}</span>
        </div>
      </header>

      <section className="hospital-matching-section" aria-labelledby="nearby-notifications-title">
        <div className="pulse-section-heading">
          <div>
            <p className="pulse-kicker">MATCH ALERTS</p>
            <h2 id="nearby-notifications-title">Nearby notifications</h2>
            <p>Choose which nearby availability updates you want this workspace to follow.</p>
          </div>
          <span className="hospital-matching-section-icon"><MapPin aria-hidden="true" /></span>
        </div>

        {isLoading ? (
          <div className="hospital-matching-loading" role="status"><LoaderCircle aria-hidden="true" /> Loading preferences…</div>
        ) : error ? (
          <div className="hospital-matching-error" role="alert">Notification preferences could not be loaded. Refresh to try again.</div>
        ) : (
          <div className="hospital-alert-grid">
            {alertOptions.map(({ type, title, description, icon: Icon }) => {
              const enabled = data?.preferences[type] ?? false
              const inputId = `alert-${type}`
              return (
                <article className="hospital-alert-card" key={type}>
                  <span className="hospital-alert-icon"><Icon aria-hidden="true" /></span>
                  <div className="hospital-alert-copy">
                    <h3 id={`${inputId}-title`}>{title}</h3>
                    <p>{description}</p>
                    <span className={`hospital-alert-state ${enabled ? 'enabled' : ''}`}>{enabled ? 'Preference on' : 'Preference off'}</span>
                  </div>
                  <button
                    id={inputId}
                    className={`hospital-alert-switch ${enabled ? 'enabled' : ''}`}
                    type="button"
                    role="switch"
                    aria-labelledby={`${inputId}-title`}
                    aria-checked={enabled}
                    disabled={savingType !== null}
                    onClick={() => void handleAlertToggle(type, !enabled)}
                  >
                    <span />
                  </button>
                </article>
              )
            })}
          </div>
        )}

        <p className="hospital-matching-note"><TriangleAlert aria-hidden="true" /> Preferences are saved in this workspace. Donor and blood bank matching feeds and delivery channels must be connected before alerts can be sent.</p>
        {preferenceMessage && <p className="hospital-matching-feedback" role="status" aria-live="polite">{preferenceMessage}</p>}
      </section>

      {error ? (
        <div className="hospital-matching-error" role="alert">Request status and history could not be loaded. Refresh to try again.</div>
      ) : (
        <div className="hospital-request-tracking-grid">
          <section className="hospital-matching-section" aria-labelledby="emergency-status-title">
            <div className="pulse-section-heading">
              <div>
                <p className="pulse-kicker">CURRENT STATUS</p>
                <h2 id="emergency-status-title">Emergency Request Status</h2>
                <p>Current status for emergency-priority requests saved by this hospital.</p>
              </div>
              <span className="hospital-matching-count"><Activity aria-hidden="true" /> {activeEmergencyRequests.length} active</span>
            </div>
            {isLoading ? (
              <div className="hospital-matching-loading" role="status"><LoaderCircle aria-hidden="true" /> Loading requests…</div>
            ) : activeEmergencyRequests.length ? (
              <ul className="hospital-emergency-list">
                {activeEmergencyRequests.map((request) => (
                  <li className="hospital-emergency-row" key={request.id}>
                    <span className="hospital-emergency-mark"><TriangleAlert aria-hidden="true" /></span>
                    <div className="hospital-emergency-details">
                      <strong>{request.bloodGroup} <span>·</span> {request.bloodComponent}</strong>
                      <span>{request.requiredUnits.toLocaleString()} units · needed {formatDate(request.requiredAt)}</span>
                      <small>{requestReference(request.id)} · submitted {formatDate(request.createdAt)}</small>
                    </div>
                    <span className={`hospital-request-status hospital-request-status-${statusClass(request.status)}`}>{request.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="hospital-matching-empty"><CheckCircle2 aria-hidden="true" /><div><strong>No active emergency requests</strong><p>New emergency requests will appear here after they are submitted.</p></div></div>
            )}
          </section>

          <section className="hospital-matching-section" aria-labelledby="emergency-history-title">
            <div className="pulse-section-heading">
              <div>
                <p className="pulse-kicker">REQUEST RECORD</p>
                <h2 id="emergency-history-title">Emergency Request History</h2>
                <p>Recently submitted emergency requests and their saved status.</p>
              </div>
              <span className="hospital-matching-count"><History aria-hidden="true" /> {emergencyRequests.length} total</span>
            </div>
            {isLoading ? (
              <div className="hospital-matching-loading" role="status"><LoaderCircle aria-hidden="true" /> Loading history…</div>
            ) : emergencyRequests.length ? (
              <ol className="hospital-history-list">
                {emergencyRequests.map((request) => (
                  <li className="hospital-history-row" key={request.id}>
                    <span className="hospital-history-icon"><Clock3 aria-hidden="true" /></span>
                    <div className="hospital-emergency-details">
                      <strong>{requestReference(request.id)} <span>·</span> {request.bloodGroup}</strong>
                      <span>{request.bloodComponent} · {request.requiredUnits.toLocaleString()} units</span>
                      <small>Submitted {formatDate(request.createdAt)} · required {formatDate(request.requiredAt)}</small>
                    </div>
                    <span className={`hospital-request-status hospital-request-status-${statusClass(request.status)}`}>{request.status}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="hospital-matching-empty"><History aria-hidden="true" /><div><strong>No emergency request history yet</strong><p>Submitted emergency requests will be recorded here.</p></div></div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
