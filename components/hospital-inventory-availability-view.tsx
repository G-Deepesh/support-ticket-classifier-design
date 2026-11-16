'use client'

import { useState, type FormEvent } from 'react'
import useSWR from 'swr'
import { AlertCircle, Building2, Check, Clock3, Crosshair, Droplets, LoaderCircle, MapPin, Plus, RefreshCw, Search } from 'lucide-react'
import { getBloodAvailability, saveBloodBankInventory } from '@/app/actions/blood-bank-inventory'

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']
const bloodComponents = ['Whole blood', 'Red blood cells', 'Platelets', 'Plasma', 'Cryoprecipitate']

const emptyForm = {
  bankName: '',
  address: '',
  city: '',
  region: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  bloodGroup: '',
  bloodComponent: '',
  availableUnits: '0',
  lowStockThreshold: '10',
}

function distanceInKilometers(origin: { latitude: number; longitude: number }, target: { latitude: number; longitude: number }) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const latitudeDelta = radians(target.latitude - origin.latitude)
  const longitudeDelta = radians(target.longitude - origin.longitude)
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(origin.latitude)) * Math.cos(radians(target.latitude)) * Math.sin(longitudeDelta / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export default function HospitalInventoryAvailabilityView({ hospitalName }: { hospitalName: string }) {
  const [filters, setFilters] = useState({ bloodGroup: '', bloodComponent: '', location: '' })
  const [appliedFilters, setAppliedFilters] = useState({ bloodGroup: '', bloodComponent: '', location: '' })
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationMessage, setLocationMessage] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const searchKey = `blood-bank-inventory:${JSON.stringify(appliedFilters)}`
  const { data, error, isLoading, mutate } = useSWR(searchKey, () => getBloodAvailability(appliedFilters))
  const records = data ?? []
  const recordsWithDistance = records.map((record) => ({
    ...record,
    distanceKm: userLocation && record.latitude !== null && record.longitude !== null
      ? distanceInKilometers(userLocation, { latitude: record.latitude, longitude: record.longitude })
      : null,
  }))
  const sortedRecords = userLocation
    ? [...recordsWithDistance].sort((left, right) => {
        if (left.distanceKm === null) return right.distanceKm === null ? 0 : 1
        if (right.distanceKm === null) return -1
        return left.distanceKm - right.distanceKm
      })
    : recordsWithDistance

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedFilters({
      bloodGroup: filters.bloodGroup,
      bloodComponent: filters.bloodComponent,
      location: filters.location.trim(),
    })
  }

  function findNearbyBanks() {
    if (!navigator.geolocation) {
      setLocationMessage('Location access is not supported by this browser. Search by city, area, or postal code instead.')
      return
    }

    setIsLocating(true)
    setLocationMessage('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude })
        setLocationMessage('Blood banks with coordinates are sorted by distance from your current location.')
        setIsLocating(false)
      },
      () => {
        setLocationMessage('Your location was not shared. Search by city, area, or postal code instead.')
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    )
  }

  async function submitInventory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setSaveMessage('')

    try {
      const result = await saveBloodBankInventory({
        bankName: form.bankName,
        address: form.address,
        city: form.city,
        region: form.region,
        postalCode: form.postalCode,
        latitude: form.latitude.trim() ? Number(form.latitude) : null,
        longitude: form.longitude.trim() ? Number(form.longitude) : null,
        bloodGroup: form.bloodGroup,
        bloodComponent: form.bloodComponent,
        availableUnits: Number(form.availableUnits),
        lowStockThreshold: Number(form.lowStockThreshold),
      })

      setSaveMessage(result.ok ? 'Blood-bank stock saved. Availability results have been refreshed.' : result.message)
      if (result.ok) await mutate()
    } catch {
      setSaveMessage('Inventory could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="pulse-overview hospital-inventory-view" aria-labelledby="hospital-inventory-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> HOSPITAL WORKSPACE</p>
          <h1 id="hospital-inventory-title">Check blood availability</h1>
          <p className="pulse-intro">Search reported blood-bank stock by group, component, and location.</p>
        </div>
        <span className="pulse-ai-chip"><Building2 aria-hidden="true" /> {hospitalName}</span>
      </header>

      <section className="hospital-inventory-section" aria-labelledby="inventory-search-title">
        <div className="pulse-section-heading">
          <div>
            <p className="pulse-kicker">INVENTORY SEARCH</p>
            <h2 id="inventory-search-title">Find available blood products</h2>
            <p>Refine by blood group, component, or a city, area, address, or postal code.</p>
          </div>
          <span className="hospital-inventory-icon"><Search aria-hidden="true" /></span>
        </div>

        <form className="hospital-inventory-filters" onSubmit={submitSearch}>
          <label className="hospital-inventory-field" htmlFor="availability-blood-group">
            <span>Blood group</span>
            <select id="availability-blood-group" value={filters.bloodGroup} onChange={(event) => setFilters((current) => ({ ...current, bloodGroup: event.target.value }))}>
              <option value="">All blood groups</option>
              {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          </label>
          <label className="hospital-inventory-field" htmlFor="availability-blood-component">
            <span>Blood component</span>
            <select id="availability-blood-component" value={filters.bloodComponent} onChange={(event) => setFilters((current) => ({ ...current, bloodComponent: event.target.value }))}>
              <option value="">All components</option>
              {bloodComponents.map((component) => <option key={component} value={component}>{component}</option>)}
            </select>
          </label>
          <label className="hospital-inventory-field hospital-inventory-location-field" htmlFor="availability-location">
            <span>Location</span>
            <span className="hospital-inventory-location-input"><MapPin aria-hidden="true" /><input id="availability-location" value={filters.location} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} placeholder="City, area, or postal code" /></span>
          </label>
          <button className="hospital-inventory-primary" type="submit"><Search aria-hidden="true" /> Check availability</button>
        </form>

        <div className="hospital-inventory-nearby-row">
          <button className="hospital-inventory-nearby-button" type="button" onClick={findNearbyBanks} disabled={isLocating}>
            {isLocating ? <LoaderCircle className="hospital-inventory-spinner" aria-hidden="true" /> : <Crosshair aria-hidden="true" />}
            {isLocating ? 'Finding nearby banks…' : userLocation ? 'Refresh nearby results' : 'Find nearby blood banks'}
          </button>
          <span className="hospital-inventory-nearby-note">Uses your browser location only when you choose this option.</span>
        </div>
        {locationMessage && <p className="hospital-inventory-feedback" role="status">{locationMessage}</p>}
      </section>

      <section className="hospital-inventory-section" aria-labelledby="inventory-results-title">
        <div className="pulse-section-heading">
          <div>
            <p className="pulse-kicker">REPORTED STOCK</p>
            <h2 id="inventory-results-title">Available units &amp; stock status</h2>
            <p>{userLocation ? 'Nearest blood banks with mapped locations appear first.' : 'Results reflect the most recently reported units.'}</p>
          </div>
          <div className="hospital-inventory-results-meta">
            <span className="hospital-inventory-count">{records.length} {records.length === 1 ? 'record' : 'records'}</span>
            <button className="hospital-inventory-refresh" type="button" onClick={() => void mutate()} disabled={isLoading} aria-label="Refresh availability results">
              {isLoading ? <LoaderCircle className="hospital-inventory-spinner" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="hospital-inventory-loading" role="status"><LoaderCircle className="hospital-inventory-spinner" aria-hidden="true" /> Loading blood-bank availability…</div>
        ) : error ? (
          <div className="hospital-inventory-error" role="alert"><AlertCircle aria-hidden="true" /> Availability could not be loaded. Refresh to try again.</div>
        ) : sortedRecords.length === 0 ? (
          <div className="hospital-inventory-empty">
            <Droplets aria-hidden="true" />
            <div>
              <strong>{appliedFilters.bloodGroup || appliedFilters.bloodComponent || appliedFilters.location ? 'No matching stock found' : 'No inventory has been reported yet'}</strong>
              <p>{appliedFilters.bloodGroup || appliedFilters.bloodComponent || appliedFilters.location ? 'Try another group, component, or location.' : 'Add a blood-bank stock report below to make availability searchable.'}</p>
            </div>
          </div>
        ) : (
          <ul className="hospital-inventory-results" aria-label="Blood-bank availability results">
            {sortedRecords.map((record) => {
              const status = record.availableUnits === 0 ? 'out' : record.availableUnits <= record.lowStockThreshold ? 'low' : 'available'
              const statusLabel = status === 'out' ? 'Out of stock' : status === 'low' ? 'Low stock' : 'Available'
              return (
                <li className="hospital-inventory-result" key={record.id}>
                  <div className="hospital-inventory-result-main">
                    <span className="hospital-inventory-bank-mark"><Building2 aria-hidden="true" /></span>
                    <div className="hospital-inventory-bank-copy">
                      <div className="hospital-inventory-bank-heading"><h3>{record.bankName}</h3><span className={`hospital-inventory-status is-${status}`}>{statusLabel}</span></div>
                      <p>{record.address}, {record.city}{record.region ? `, ${record.region}` : ''}{record.postalCode ? ` ${record.postalCode}` : ''}</p>
                      <div className="hospital-inventory-tags"><span>{record.bloodGroup}</span><span>{record.bloodComponent}</span></div>
                    </div>
                  </div>
                  <div className="hospital-inventory-units">
                    <strong>{record.availableUnits.toLocaleString()}</strong>
                    <span>available units</span>
                    <small>Low-stock threshold: {record.lowStockThreshold}</small>
                  </div>
                  <div className="hospital-inventory-record-meta">
                    {record.distanceKm !== null ? <span><MapPin aria-hidden="true" /> {record.distanceKm < 1 ? `${Math.round(record.distanceKm * 1000)} m` : `${record.distanceKm.toFixed(1)} km`}</span> : <span><MapPin aria-hidden="true" /> {userLocation ? 'Distance unavailable' : `${record.city}${record.region ? `, ${record.region}` : ''}`}</span>}
                    <span><Clock3 aria-hidden="true" /> Updated {new Date(record.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <p className="hospital-inventory-clinical-note"><AlertCircle aria-hidden="true" /> Stock reports are informational and may change. Confirm availability, compatibility, and product suitability directly with the blood bank before clinical use.</p>
      </section>

      <details className="hospital-inventory-manage">
        <summary><span className="hospital-inventory-manage-icon"><Plus aria-hidden="true" /></span><span><strong>Add or update blood-bank stock</strong><small>Save a reported unit count and location in the shared inventory.</small></span></summary>
        <form className="hospital-inventory-entry-form" onSubmit={submitInventory}>
          <div className="hospital-inventory-entry-grid">
            <label className="hospital-inventory-field hospital-inventory-entry-wide" htmlFor="inventory-bank-name"><span>Blood-bank name</span><input id="inventory-bank-name" autoComplete="organization" required maxLength={120} value={form.bankName} onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))} placeholder="e.g. Central Blood Bank" /></label>
            <label className="hospital-inventory-field hospital-inventory-entry-wide" htmlFor="inventory-address"><span>Street address</span><input id="inventory-address" autoComplete="street-address" required maxLength={240} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Street address" /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-city"><span>City</span><input id="inventory-city" autoComplete="address-level2" required maxLength={100} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-region"><span>Region / state</span><input id="inventory-region" autoComplete="address-level1" maxLength={100} value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} placeholder="Region or state" /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-postal"><span>Postal code</span><input id="inventory-postal" autoComplete="postal-code" maxLength={20} value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} placeholder="Postal code" /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-group"><span>Blood group</span><select id="inventory-group" required value={form.bloodGroup} onChange={(event) => setForm((current) => ({ ...current, bloodGroup: event.target.value }))}><option value="">Select group</option>{bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
            <label className="hospital-inventory-field" htmlFor="inventory-component"><span>Blood component</span><select id="inventory-component" required value={form.bloodComponent} onChange={(event) => setForm((current) => ({ ...current, bloodComponent: event.target.value }))}><option value="">Select component</option>{bloodComponents.map((component) => <option key={component} value={component}>{component}</option>)}</select></label>
            <label className="hospital-inventory-field" htmlFor="inventory-units"><span>Available units</span><input id="inventory-units" type="number" min="0" max="1000000" step="1" required value={form.availableUnits} onChange={(event) => setForm((current) => ({ ...current, availableUnits: event.target.value }))} /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-threshold"><span>Low-stock threshold</span><input id="inventory-threshold" type="number" min="0" max="100000" step="1" required value={form.lowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))} /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-latitude"><span>Latitude <small>optional</small></span><input id="inventory-latitude" type="number" min="-90" max="90" step="any" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} placeholder="e.g. 40.7128" /></label>
            <label className="hospital-inventory-field" htmlFor="inventory-longitude"><span>Longitude <small>optional</small></span><input id="inventory-longitude" type="number" min="-180" max="180" step="any" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} placeholder="e.g. -74.0060" /></label>
          </div>
          <div className="hospital-inventory-entry-footer">
            <p>Use coordinates to include this bank in nearby-distance sorting. Updating the same bank, group, and component replaces its previous unit count.</p>
            <button className="hospital-inventory-primary" type="submit" disabled={isSaving}>{isSaving ? <LoaderCircle className="hospital-inventory-spinner" aria-hidden="true" /> : <Check aria-hidden="true" />}{isSaving ? 'Saving stock…' : 'Save stock report'}</button>
          </div>
          {saveMessage && <p className={`hospital-inventory-save-message ${saveMessage.startsWith('Blood-bank stock saved') ? 'is-success' : 'is-error'}`} role="status">{saveMessage}</p>}
        </form>
      </details>
    </section>
  )
}
