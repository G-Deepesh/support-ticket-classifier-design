'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { BadgeCheck, Camera, CalendarDays, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from 'lucide-react'

type DonorProfileForm = {
  name: string
  dateOfBirth: string
  bloodGroup: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
}

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']
const maximumPhotoSize = 5 * 1024 * 1024

function getAge(dateOfBirth: string) {
  if (!dateOfBirth) return '—'
  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return '—'
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const birthdayHasPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!birthdayHasPassed) age -= 1
  return String(age)
}

export default function DonorProfileView({ initialName, onNameChange }: { initialName: string; onNameChange: (name: string) => void }) {
  const [form, setForm] = useState<DonorProfileForm>({
    name: initialName,
    dateOfBirth: '',
    bloodGroup: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [aadhaarNotice, setAadhaarNotice] = useState('')
  const aadhaarInputRef = useRef<HTMLInputElement>(null)
  const initials = form.name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const updateField = <K extends keyof DonorProfileForm>(key: K, value: DonorProfileForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setSaveNotice('')
    if (key === 'name') onNameChange(value as string)
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WebP image.')
      event.currentTarget.value = ''
      return
    }
    if (file.size > maximumPhotoSize) {
      setPhotoError('Choose an image smaller than 5 MB.')
      event.currentTarget.value = ''
      return
    }
    setPhotoError('')
    setPhotoPreview(URL.createObjectURL(file))
    setSaveNotice('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveNotice('Profile updated.')
  }

  const handleAadhaarContinue = () => {
    const input = aadhaarInputRef.current
    const aadhaarNumber = input?.value ?? ''
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setAadhaarNotice('Enter a valid 12-digit Aadhaar number.')
      return
    }
    if (input) input.value = ''
    setAadhaarNotice('No authorized provider is connected. Your number was not sent.')
  }

  return (
    <section className="pulse-overview donor-profile-view" aria-labelledby="donor-profile-title">
      <header className="pulse-overview-heading donor-profile-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> DONOR SERVICES · PROFILE</p>
          <h1 id="donor-profile-title">Your donor <span>profile.</span></h1>
          <p className="pulse-intro">Keep your contact details and donation information up to date.</p>
        </div>
      </header>

      <form className="donor-profile-form" onSubmit={handleSubmit}>
        <div className="donor-profile-layout">
          <aside className="pulse-panel donor-profile-photo-card" aria-label="Profile photo">
            <div className="donor-profile-avatar" aria-hidden="true">
              {photoPreview ? <img src={photoPreview} alt="" /> : initials ? <span>{initials}</span> : <UserRound />}
            </div>
            <h2>{form.name || 'Your profile'}</h2>
            <p>Blood donor</p>
            <label className="donor-photo-upload"><Camera aria-hidden="true" /> {photoPreview ? 'Change photo' : 'Add profile photo'}<input className="donor-photo-input" id="donor-photo-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} aria-describedby="donor-photo-help donor-photo-error" /></label>
            <span className="donor-photo-help" id="donor-photo-help">JPG, PNG, or WebP · up to 5 MB</span>
            <span className="donor-photo-error" id="donor-photo-error" role="alert">{photoError}</span>
            <div className="donor-profile-photo-status"><BadgeCheck aria-hidden="true" /><span><strong>Profile details</strong><small>Review before sharing with a donation center</small></span></div>
          </aside>

          <div className="donor-profile-form-content">
            <section className="pulse-panel donor-profile-section" aria-labelledby="donor-personal-title">
              <div className="donor-profile-section-heading"><div><p className="pulse-kicker">PERSONAL DETAILS</p><h2 id="donor-personal-title">Personal information</h2><p>Basic details used to identify your donor profile.</p></div><UserRound aria-hidden="true" /></div>
              <div className="donor-profile-field-grid">
                <label className="donor-profile-field donor-profile-field-wide" htmlFor="donor-name">Full name<input id="donor-name" autoComplete="name" required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter your full name" /></label>
                <label className="donor-profile-field" htmlFor="donor-dob">Date of birth<span className="donor-profile-input-wrap"><CalendarDays aria-hidden="true" /><input id="donor-dob" type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} /></span></label>
                <label className="donor-profile-field" htmlFor="donor-age">Age <span className="donor-profile-field-hint">calculated from date of birth</span><input id="donor-age" value={getAge(form.dateOfBirth)} readOnly aria-readonly="true" /></label>
                <label className="donor-profile-field" htmlFor="donor-blood-group">Blood group<select id="donor-blood-group" value={form.bloodGroup} onChange={(event) => updateField('bloodGroup', event.target.value)}><option value="">Select blood group</option>{bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
              </div>
            </section>

            <section className="pulse-panel donor-profile-section" aria-labelledby="donor-contact-title">
              <div className="donor-profile-section-heading"><div><p className="pulse-kicker">HOW TO REACH YOU</p><h2 id="donor-contact-title">Contact information</h2><p>Choose details your donation center can use to contact you.</p></div><Phone aria-hidden="true" /></div>
              <div className="donor-profile-field-grid">
                <label className="donor-profile-field" htmlFor="donor-email">Email address<span className="donor-profile-input-wrap"><Mail aria-hidden="true" /><input id="donor-email" type="email" autoComplete="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" /></span></label>
                <label className="donor-profile-field" htmlFor="donor-phone">Phone number<span className="donor-profile-input-wrap"><Phone aria-hidden="true" /><input id="donor-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Add a contact number" /></span></label>
              </div>
            </section>

            <section className="pulse-panel donor-profile-section" aria-labelledby="donor-location-title">
              <div className="donor-profile-section-heading"><div><p className="pulse-kicker">DONATION AREA</p><h2 id="donor-location-title">Location &amp; address</h2><p>Used to help you find nearby donation opportunities.</p></div><MapPin aria-hidden="true" /></div>
              <div className="donor-profile-field-grid">
                <label className="donor-profile-field donor-profile-field-wide" htmlFor="donor-address">Street address<textarea id="donor-address" autoComplete="street-address" rows={2} value={form.address} onChange={(event) => updateField('address', event.target.value)} placeholder="House number, street, area" /></label>
                <label className="donor-profile-field" htmlFor="donor-city">City<input id="donor-city" autoComplete="address-level2" value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="City" /></label>
                <label className="donor-profile-field" htmlFor="donor-state">State / region<input id="donor-state" autoComplete="address-level1" value={form.state} onChange={(event) => updateField('state', event.target.value)} placeholder="State or region" /></label>
                <label className="donor-profile-field" htmlFor="donor-postal-code">Postal code<input id="donor-postal-code" autoComplete="postal-code" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} placeholder="Postal code" /></label>
              </div>
            </section>

            <section className="donor-verification-card" aria-labelledby="donor-verification-title">
              <span className="donor-verification-icon"><ShieldCheck aria-hidden="true" /></span>
              <div className="donor-verification-copy"><p className="pulse-kicker">IDENTITY CHECK</p><h2 id="donor-verification-title">Aadhaar verification</h2><p>Enter your 12-digit Aadhaar number to continue. Verification requires an authorized provider, and the number will not be sent until one is connected.</p><div className="donor-verification-entry"><label className="donor-profile-field" htmlFor="donor-aadhaar-number">Aadhaar number<input id="donor-aadhaar-number" ref={aadhaarInputRef} type="password" inputMode="numeric" autoComplete="off" maxLength={12} pattern="[0-9]{12}" onChange={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 12); setAadhaarNotice('') }} placeholder="12-digit number" aria-describedby="donor-aadhaar-status" /></label><button className="donor-verification-button" type="button" onClick={handleAadhaarContinue}>Continue</button></div><p className="donor-verification-notice" id="donor-aadhaar-status" role="status" aria-live="polite">{aadhaarNotice}</p></div>
              <span className="donor-verification-status">Not connected</span>
            </section>

            <div className="donor-profile-save-row">
              <p role="status" aria-live="polite">{saveNotice}</p>
              <button className="donor-profile-save-button" type="submit"><Save aria-hidden="true" /> Save profile</button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}
