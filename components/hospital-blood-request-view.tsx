'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, ClipboardList, Clock3, Hospital, LoaderCircle, RotateCcw, Send } from 'lucide-react'
import { createHospitalBloodRequest } from '@/app/actions/hospital-blood-request'
import {
  BLOOD_COMPONENTS,
  BLOOD_GROUPS,
  REQUEST_PRIORITIES,
} from '@/lib/hospital-blood-request-options'

type Confirmation = {
  id: string
  bloodGroup: string
  bloodComponent: string
  requiredUnits: number
  requiredAt: string
  priority: string
  status: string
  createdAt: string
}

function toLocalDateTimeValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

export default function HospitalBloodRequestView({ hospitalName }: { hospitalName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null)
  const bloodGroupSelectRef = useRef<HTMLSelectElement>(null)
  const hasShownConfirmation = useRef(false)
  const minRequiredAt = toLocalDateTimeValue(new Date())

  useEffect(() => {
    if (confirmation) {
      confirmationHeadingRef.current?.focus()
      hasShownConfirmation.current = true
      return
    }

    if (hasShownConfirmation.current) bloodGroupSelectRef.current?.focus()
  }, [confirmation])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const requiredAtInput = String(formData.get('requiredAt') ?? '')
    const requiredAt = new Date(requiredAtInput)

    if (Number.isNaN(requiredAt.getTime()) || requiredAt.getTime() <= Date.now()) {
      setErrorMessage('Choose a required date and time in the future.')
      return
    }

    formData.set('requiredAt', requiredAt.toISOString())
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const result = await createHospitalBloodRequest(formData)
      if (!result.ok) {
        setErrorMessage(result.message)
        return
      }

      setConfirmation(result.request)
      form.reset()
    } catch {
      setErrorMessage('We could not save your request. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function createAnotherRequest() {
    setConfirmation(null)
    setErrorMessage('')
  }

  return (
    <section className="pulse-overview" aria-labelledby="hospital-request-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> HOSPITAL WORKSPACE</p>
          <h1 id="hospital-request-title">Blood request</h1>
          <p className="pulse-intro">Create a request for blood products needed by your care team.</p>
        </div>
        <span className="pulse-ai-chip"><Hospital aria-hidden="true" /> {hospitalName}</span>
      </header>

      <section className="pulse-panel hospital-request-panel" aria-labelledby="new-hospital-request-title">
        <div className="pulse-section-heading">
          <div>
            <p className="pulse-kicker">NEW REQUEST</p>
            <h2 id="new-hospital-request-title">Create new request</h2>
            <p>Select the product, quantity, timing, and priority for this request.</p>
          </div>
          {!confirmation && <span className="hospital-request-required-note">All fields required</span>}
        </div>

        {confirmation ? (
          <section className="hospital-request-confirmation" role="status" aria-live="polite" aria-labelledby="request-confirmation-title">
            <div className="hospital-request-confirmation-heading">
              <span className="hospital-request-confirmation-icon"><CheckCircle2 aria-hidden="true" /></span>
              <div>
                <p className="pulse-kicker">REQUEST CONFIRMATION</p>
                <h3 id="request-confirmation-title" ref={confirmationHeadingRef} tabIndex={-1}>Request submitted</h3>
                <p>Your request has been saved to the Hospital workspace.</p>
              </div>
            </div>
            <div className="hospital-request-reference">
              <span>Request reference</span>
              <strong title={confirmation.id}>HR-{confirmation.id.slice(0, 8).toUpperCase()}</strong>
              <small>{confirmation.id}</small>
            </div>
            <dl className="hospital-request-summary">
              <div><dt>Blood group</dt><dd>{confirmation.bloodGroup}</dd></div>
              <div><dt>Blood component</dt><dd>{confirmation.bloodComponent}</dd></div>
              <div><dt>Required units</dt><dd>{confirmation.requiredUnits}</dd></div>
              <div><dt>Required date &amp; time</dt><dd>{new Date(confirmation.requiredAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
              <div><dt>Priority</dt><dd>{confirmation.priority}</dd></div>
              <div><dt>Status</dt><dd><span className="hospital-request-status">{confirmation.status}</span></dd></div>
              <div><dt>Submitted</dt><dd>{new Date(confirmation.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
            </dl>
            <button className="hospital-request-submit" type="button" onClick={createAnotherRequest}>
              <RotateCcw aria-hidden="true" /> Create another request
            </button>
          </section>
        ) : (
          <form className="hospital-request-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <div className="hospital-request-form-grid">
              <div className="hospital-request-field">
                <label htmlFor="blood-group">Blood group <span aria-hidden="true">*</span></label>
                <select id="blood-group" name="bloodGroup" defaultValue="" required ref={bloodGroupSelectRef}>
                  <option value="" disabled>Select blood group</option>
                  {BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </div>
              <div className="hospital-request-field">
                <label htmlFor="blood-component">Blood component <span aria-hidden="true">*</span></label>
                <select id="blood-component" name="bloodComponent" defaultValue="" required>
                  <option value="" disabled>Select component</option>
                  {BLOOD_COMPONENTS.map((component) => <option key={component} value={component}>{component}</option>)}
                </select>
              </div>
              <div className="hospital-request-field">
                <label htmlFor="required-units">Required units <span aria-hidden="true">*</span></label>
                <input id="required-units" name="requiredUnits" type="number" min="1" max="10000" step="1" placeholder="Enter number of units" required />
              </div>
              <div className="hospital-request-field">
                <label htmlFor="required-at">Required date &amp; time <span aria-hidden="true">*</span></label>
                <input id="required-at" name="requiredAt" type="datetime-local" min={minRequiredAt} required />
              </div>
              <div className="hospital-request-field hospital-request-field-wide">
                <label htmlFor="request-priority">Priority level <span aria-hidden="true">*</span></label>
                <select id="request-priority" name="priority" defaultValue="" required>
                  <option value="" disabled>Select priority level</option>
                  {REQUEST_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
            </div>

            {errorMessage && <p className="hospital-request-error" role="alert">{errorMessage}</p>}

            <div className="hospital-request-form-actions">
              <p className="hospital-request-footnote"><Clock3 aria-hidden="true" /> Do not include patient identifiers in this request.</p>
              <button className="hospital-request-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="hospital-request-spinner" aria-hidden="true" /> : <Send aria-hidden="true" />}
                {isSubmitting ? 'Submitting request…' : 'Submit request'}
              </button>
            </div>
          </form>
        )}
      </section>
      <p className="hospital-request-clinical-note"><ClipboardList aria-hidden="true" /> Confirm product selection and transfusion requirements with your clinical team.</p>
    </section>
  )
}
