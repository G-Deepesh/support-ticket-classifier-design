'use client'

import { useMemo, useState } from 'react'
import { Activity, Building2, Check, ChevronRight, Droplets, HeartPulse, Info, Mail, MapPin, Phone, Search, ShieldCheck, Users } from 'lucide-react'

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']
const locations = ['Seattle', 'Portland', 'Tacoma', 'Spokane']
const compatibleDonors: Record<string, string[]> = {
  'A+': ['A+', 'A−', 'O+', 'O−'], 'A−': ['A−', 'O−'],
  'B+': ['B+', 'B−', 'O+', 'O−'], 'B−': ['B−', 'O−'],
  'AB+': bloodGroups, 'AB−': ['AB−', 'A−', 'B−', 'O−'],
  'O+': ['O+', 'O−'], 'O−': ['O−'],
}

const donors = [
  { id: 'd-1', name: 'Maya R.', group: 'O−', city: 'Seattle', distance: '2.4 mi', lastDonation: '8 months ago', available: 'Available this week' },
  { id: 'd-2', name: 'Ethan K.', group: 'A+', city: 'Seattle', distance: '4.1 mi', lastDonation: '6 months ago', available: 'Available this week' },
  { id: 'd-3', name: 'Sofia L.', group: 'B−', city: 'Portland', distance: '3.2 mi', lastDonation: '7 months ago', available: 'Availability not confirmed' },
  { id: 'd-4', name: 'Noah T.', group: 'O+', city: 'Tacoma', distance: '1.8 mi', lastDonation: '5 months ago', available: 'Available this month' },
  { id: 'd-5', name: 'Avery M.', group: 'AB−', city: 'Spokane', distance: '5.6 mi', lastDonation: '9 months ago', available: 'Availability not confirmed' },
  { id: 'd-6', name: 'Jordan P.', group: 'A−', city: 'Portland', distance: '2.7 mi', lastDonation: '11 months ago', available: 'Available this week' },
]

const bloodBanks = [
  { id: 'b-1', name: 'Evergreen Community Blood Center', city: 'Seattle', address: '410 Pine Street, Seattle, WA', distance: '2.1 mi', phone: '(555) 010-0142', email: 'intake@evergreen.example', inventory: { 'A+': 18, 'A−': 6, 'B+': 12, 'B−': 4, 'AB+': 8, 'AB−': 3, 'O+': 24, 'O−': 5 } },
  { id: 'b-2', name: 'Harbor Regional Blood Services', city: 'Tacoma', address: '82 Harbor Avenue, Tacoma, WA', distance: '4.6 mi', phone: '(555) 010-0188', email: 'care@harborregional.example', inventory: { 'A+': 10, 'A−': 2, 'B+': 7, 'B−': 3, 'AB+': 5, 'AB−': 1, 'O+': 16, 'O−': 4 } },
  { id: 'b-3', name: 'Rose City Blood Bank', city: 'Portland', address: '225 West Burnside, Portland, OR', distance: '1.9 mi', phone: '(555) 010-0125', email: 'connect@rosecity.example', inventory: { 'A+': 14, 'A−': 4, 'B+': 9, 'B−': 2, 'AB+': 6, 'AB−': 2, 'O+': 20, 'O−': 3 } },
  { id: 'b-4', name: 'Inland Northwest Blood Center', city: 'Spokane', address: '710 Riverside Avenue, Spokane, WA', distance: '3.8 mi', phone: '(555) 010-0171', email: 'hello@inlandnw.example', inventory: { 'A+': 11, 'A−': 3, 'B+': 8, 'B−': 2, 'AB+': 4, 'AB−': 2, 'O+': 15, 'O−': 3 } },
]

type DirectoryTab = 'donors' | 'banks'

export default function DonorBloodBankSearchView({ profileName }: { profileName: string }) {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('donors')
  const [query, setQuery] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [location, setLocation] = useState('')
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [contactNotice, setContactNotice] = useState('')

  const matchingDonors = useMemo(() => {
    const term = query.trim().toLowerCase()
    return donors.filter((donor) => {
      const matchesTerm = !term || `${donor.name} ${donor.city}`.toLowerCase().includes(term)
      const matchesGroup = !bloodGroup || (compatibleDonors[bloodGroup] ?? []).includes(donor.group)
      const matchesLocation = !location || donor.city === location
      return matchesTerm && matchesGroup && matchesLocation
    })
  }, [bloodGroup, location, query])

  const matchingBanks = useMemo(() => {
    const term = query.trim().toLowerCase()
    return bloodBanks.filter((bank) => {
      const matchesTerm = !term || `${bank.name} ${bank.city} ${bank.address}`.toLowerCase().includes(term)
      const matchesGroup = !bloodGroup || bank.inventory[bloodGroup as keyof typeof bank.inventory] > 0
      const matchesLocation = !location || bank.city === location
      return matchesTerm && matchesGroup && matchesLocation
    })
  }, [bloodGroup, location, query])

  const selectedBank = bloodBanks.find((bank) => bank.id === selectedBankId) ?? null
  const selectTab = (tab: DirectoryTab) => {
    setActiveTab(tab)
    setQuery('')
    setBloodGroup('')
    setLocation('')
    setContactNotice('')
  }

  return (
    <section className="pulse-overview directory-view" aria-labelledby="directory-title">
      <header className="pulse-overview-heading directory-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> HOSPITAL WORKSPACE · NETWORK DIRECTORY</p>
          <h1 id="directory-title">Donor &amp; Blood bank search</h1>
          <p className="pulse-intro">Find nearby donors and verified blood banks to coordinate availability.</p>
        </div>
        <span className="pulse-ai-chip"><Users aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="directory-demo-note" role="note"><Info aria-hidden="true" /><span><strong>Interactive sample directory</strong> — all people, locations, inventory, and contact details below are illustrative, not live or actionable.</span></div>

      <div className="directory-summary" aria-label="Directory overview">
        <div className="directory-summary-card"><span className="directory-summary-icon donor"><Users aria-hidden="true" /></span><span><small>Sample donor profiles</small><strong>06</strong></span></div>
        <div className="directory-summary-card"><span className="directory-summary-icon bank"><Building2 aria-hidden="true" /></span><span><small>Sample verified banks</small><strong>04</strong></span></div>
        <div className="directory-summary-card"><span className="directory-summary-icon group"><Droplets aria-hidden="true" /></span><span><small>Blood groups covered</small><strong>08</strong></span></div>
      </div>

      <section className="pulse-panel directory-panel" aria-label="Search donors and blood banks">
        <div className="directory-tabs" role="tablist" aria-label="Directory type">
          <button id="directory-tab-donors" role="tab" aria-selected={activeTab === 'donors'} aria-controls="directory-results" type="button" className={activeTab === 'donors' ? 'active' : ''} onClick={() => selectTab('donors')}><Users aria-hidden="true" /> Search Donors <span>{donors.length}</span></button>
          <button id="directory-tab-banks" role="tab" aria-selected={activeTab === 'banks'} aria-controls="directory-results" type="button" className={activeTab === 'banks' ? 'active' : ''} onClick={() => selectTab('banks')}><Building2 aria-hidden="true" /> Search Registered Blood Banks <span>{bloodBanks.length}</span></button>
        </div>

        <div className="directory-filter-row">
          <label className="directory-search-field"><span className="sr-only">{activeTab === 'donors' ? 'Search donors' : 'Search blood banks'}</span><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activeTab === 'donors' ? 'Search donors by name or location' : 'Search registered blood banks'} /></label>
          <label className="directory-select-field"><span className="sr-only">Blood group</span><Droplets aria-hidden="true" /><select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}><option value="">{activeTab === 'donors' ? 'Compatible blood group' : 'Any blood group'}</option>{bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
          <label className="directory-select-field"><span className="sr-only">Search by location</span><MapPin aria-hidden="true" /><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">Search by location</option>{locations.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
        </div>

        <div className="directory-result-heading">
          <div><p className="pulse-kicker">{activeTab === 'donors' ? 'ELIGIBLE DONOR RECOMMENDATIONS' : 'REGISTERED BLOOD BANKS'}</p><h2>{activeTab === 'donors' ? 'Nearby donor matches' : 'Verified blood banks'}</h2><p>{activeTab === 'donors' ? `${matchingDonors.length} sample donor ${matchingDonors.length === 1 ? 'profile' : 'profiles'} match your search` : `${matchingBanks.length} sample blood ${matchingBanks.length === 1 ? 'bank' : 'banks'} match your search`}</p></div>
          <span className="directory-location-chip"><MapPin aria-hidden="true" /> {location || 'All locations'}</span>
        </div>

        <div id="directory-results" role="tabpanel" aria-labelledby={activeTab === 'donors' ? 'directory-tab-donors' : 'directory-tab-banks'}>
          {activeTab === 'donors' ? (
            matchingDonors.length ? <div className="directory-card-grid">{matchingDonors.map((donor, index) => (
              <article className="directory-person-card" key={donor.id}>
                <div className="directory-person-top"><span className="directory-avatar" aria-hidden="true">{donor.name.replace('.', '').split(' ').map((part) => part[0]).join('')}</span><span className="directory-distance"><MapPin aria-hidden="true" /> {donor.distance}</span></div>
                <div className="directory-person-title"><div><h3>{donor.name}</h3><p>{donor.city} · Donor profile</p></div><span className="directory-blood-group">{donor.group}</span></div>
                <div className="directory-eligibility"><span><Check aria-hidden="true" /> Self-reported available</span><small>{donor.available}</small></div>
                <div className="directory-person-footer"><span><Activity aria-hidden="true" /> Last donation: {donor.lastDonation}</span><span className="directory-match-score">{index < 2 ? 'Strong match' : 'Potential match'}</span></div>
              </article>
            ))}</div> : <div className="directory-empty"><Search aria-hidden="true" /><strong>No donor matches found</strong><span>Try another blood group or location.</span></div>
          ) : (
            <div className="directory-bank-layout">
              {matchingBanks.length ? <div className="directory-bank-list">{matchingBanks.map((bank) => (
                <button key={bank.id} type="button" className={`directory-bank-card${selectedBankId === bank.id ? ' selected' : ''}`} onClick={() => { setSelectedBankId(bank.id); setContactNotice('') }}>
                  <span className="directory-bank-icon"><Building2 aria-hidden="true" /></span><span className="directory-bank-copy"><strong>{bank.name}</strong><small><MapPin aria-hidden="true" /> {bank.city} · {bank.distance}</small><span className="directory-verified"><ShieldCheck aria-hidden="true" /> Verified sample listing</span></span><ChevronRight aria-hidden="true" />
                </button>
              ))}</div> : <div className="directory-empty"><Search aria-hidden="true" /><strong>No blood banks found</strong><span>Try another blood group or location.</span></div>}

              {selectedBank ? <aside className="directory-bank-details" aria-label={`${selectedBank.name} details`}>
                <div className="directory-detail-title"><span className="directory-bank-icon"><Building2 aria-hidden="true" /></span><span><small>VERIFIED SAMPLE LISTING</small><h3>{selectedBank.name}</h3></span></div>
                <p className="directory-bank-address"><MapPin aria-hidden="true" /> {selectedBank.address}</p>
                <p className="directory-stock-label">Sample availability</p>
                <div className="directory-stock-grid">{bloodGroups.map((group) => <span key={group} className={(selectedBank.inventory[group as keyof typeof selectedBank.inventory] ?? 0) > 0 ? '' : 'empty'}><b>{group}</b><small>{selectedBank.inventory[group as keyof typeof selectedBank.inventory] ?? 0} units</small></span>)}</div>
                <div className="directory-contact-list"><span><Phone aria-hidden="true" /> {selectedBank.phone}</span><span><Mail aria-hidden="true" /> {selectedBank.email}</span></div>
                <button className="directory-contact-button" type="button" onClick={() => setContactNotice(`Demo only — no message was sent to ${selectedBank.name}.`)}><Mail aria-hidden="true" /> Contact verified blood bank</button>
                {contactNotice && <p className="directory-contact-notice" role="status" aria-live="polite">{contactNotice}</p>}
              </aside> : <aside className="directory-bank-prompt"><span><HeartPulse aria-hidden="true" /></span><strong>Blood bank details</strong><p>Select a bank to view its sample details, availability, and contact options.</p></aside>}
            </div>
          )}
        </div>

        <p className="directory-clinical-note"><ShieldCheck aria-hidden="true" /> Donor matches are preliminary recommendations only. Final eligibility, compatibility, inventory, and availability must be confirmed by qualified staff.</p>
      </section>
    </section>
  )
}
