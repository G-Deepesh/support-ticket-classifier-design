'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, Check, Droplets, Info, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { inventory } from '@/lib/blood-inventory'

const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']
const components = ['Red blood cells', 'Platelets', 'Plasma', 'Whole blood']
const componentShares = [0.4, 0.25, 0.25, 0.1]
const nearbyLimit = 25

const centers = [
  { id: 'evergreen', name: 'Evergreen Community Blood Center', city: 'Seattle', seattleDistance: 2.1, share: 0.42 },
  { id: 'harbor', name: 'Harbor Regional Blood Services', city: 'Tacoma', seattleDistance: 24.4, share: 0.28 },
  { id: 'rose-city', name: 'Rose City Blood Bank', city: 'Portland', seattleDistance: 173, share: 0.18 },
  { id: 'inland', name: 'Inland Northwest Blood Center', city: 'Spokane', seattleDistance: 278, share: 0.12 },
]

const distances: Record<string, Record<string, number>> = {
  Seattle: { Seattle: 2.1, Tacoma: 24.4, Portland: 173, Spokane: 278 },
  Tacoma: { Seattle: 24.4, Tacoma: 2.4, Portland: 145, Spokane: 300 },
  Portland: { Seattle: 173, Tacoma: 145, Portland: 1.9, Spokane: 354 },
  Spokane: { Seattle: 278, Tacoma: 300, Portland: 354, Spokane: 3.8 },
}

function allocate(total: number, weights: number[]) {
  const allocated = weights.map((weight) => Math.floor(total * weight))
  for (let remainder = total - allocated.reduce((sum, value) => sum + value, 0), index = 0; remainder > 0; remainder -= 1, index += 1) {
    allocated[index % allocated.length] += 1
  }
  return allocated
}

const records = centers.flatMap((center, centerIndex) => inventory.flatMap((group) => {
  const centerUnits = allocate(group.units, centers.map((item) => item.share))[centerIndex]
  const centerReserve = allocate(group.reserve, centers.map((item) => item.share))[centerIndex]
  const unitsByComponent = allocate(centerUnits, componentShares)
  const reserveByComponent = allocate(centerReserve, componentShares)

  return components.map((component, componentIndex) => ({
    centerId: center.id,
    group: group.group,
    component,
    units: unitsByComponent[componentIndex],
    reserve: reserveByComponent[componentIndex],
  }))
}))

type InventoryFilter = 'all' | 'below-reserve' | 'in-range'

export default function HospitalInventoryAvailabilityView({ hospitalName }: { hospitalName: string }) {
  const [filter, setFilter] = useState<InventoryFilter>('all')
  const [bloodGroup, setBloodGroup] = useState('')
  const [component, setComponent] = useState('')
  const [location, setLocation] = useState('')
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const normalizedLocation = location.trim().toLowerCase()
  const searchOrigin = centers.find((center) => center.city.toLowerCase() === normalizedLocation)?.city ?? 'Seattle'

  const matchingCenters = useMemo(() => centers
    .map((center) => ({ ...center, distance: distances[searchOrigin]?.[center.city] ?? center.seattleDistance }))
    .filter((center) => !normalizedLocation || `${center.name} ${center.city}`.toLowerCase().includes(normalizedLocation))
    .filter((center) => !nearbyOnly || center.distance <= nearbyLimit)
    .sort((a, b) => a.distance - b.distance), [nearbyOnly, normalizedLocation, searchOrigin])

  const filteredRecords = useMemo(() => records.filter((record) =>
    matchingCenters.some((center) => center.id === record.centerId) && (!bloodGroup || record.group === bloodGroup) && (!component || record.component === component),
  ), [bloodGroup, component, matchingCenters])

  const stockByGroup = useMemo(() => bloodGroups.map((group) => {
    const groupRecords = filteredRecords.filter((record) => record.group === group)
    const units = groupRecords.reduce((sum, record) => sum + record.units, 0)
    const reserve = groupRecords.reduce((sum, record) => sum + record.reserve, 0)
    return { group, units, reserve, belowReserve: units < reserve }
  }).filter((group) => !bloodGroup || group.group === bloodGroup), [bloodGroup, filteredRecords])

  const totalUnits = stockByGroup.reduce((sum, group) => sum + group.units, 0)
  const belowReserveCount = stockByGroup.filter((group) => group.belowReserve).length
  const statusFilteredGroups = stockByGroup.filter((group) => filter === 'all' || (filter === 'below-reserve' ? group.belowReserve : !group.belowReserve))
  const componentLabel = component || 'All components'

  return (
    <section className="pulse-overview inventory-availability-view" aria-labelledby="inventory-availability-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> HOSPITAL WORKSPACE · NETWORK INVENTORY</p>
          <h1 id="inventory-availability-title">Inventory availability</h1>
          <p className="pulse-intro">Check blood availability by group, component, and location across nearby blood banks.</p>
        </div>
        <span className="pulse-ai-chip"><Droplets aria-hidden="true" /> {hospitalName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Illustrative inventory and locations only. Confirm live stock and availability with your blood bank.</div>

      <section className="pulse-panel availability-panel" aria-label="Blood availability search">
        <div className="availability-heading">
          <div><p className="pulse-kicker">CHECK BLOOD AVAILABILITY</p><h2>Search inventory</h2><p>Find reported units and stock status across the sample network.</p></div>
          <span className="availability-snapshot"><span className="pulse-status-dot" /> Sample network</span>
        </div>

        <div className="availability-search-grid">
          <label className="availability-field"><span>Blood group</span><select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}><option value="">All blood groups</option>{bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
          <label className="availability-field"><span>Blood component</span><select value={component} onChange={(event) => setComponent(event.target.value)}><option value="">All components</option>{components.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="availability-field availability-location"><span>Search by location</span><span className="availability-location-input"><Search aria-hidden="true" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or blood bank" list="availability-locations" /><datalist id="availability-locations">{centers.map((center) => <option key={center.city} value={center.city} />)}</datalist></span></label>
        </div>

        <div className="availability-results-heading">
          <div><p className="pulse-kicker">AVAILABLE UNITS · {componentLabel.toUpperCase()}</p><h2>Stock availability status</h2><p>{totalUnits.toLocaleString()} sample units across {matchingCenters.length} matching {matchingCenters.length === 1 ? 'blood bank' : 'blood banks'}</p></div>
          <div className="availability-result-actions">
            <button type="button" className={`availability-nearby-toggle${nearbyOnly ? ' active' : ''}`} aria-pressed={nearbyOnly} onClick={() => setNearbyOnly((current) => !current)}><MapPin aria-hidden="true" /> {nearbyOnly ? 'Nearby only' : 'Nearby blood banks'}</button>
          </div>
        </div>

        <div className="availability-summary">
          <article><span className="availability-summary-icon"><Droplets aria-hidden="true" /></span><span><small>Available units</small><strong>{totalUnits.toLocaleString()}</strong></span></article>
          <article><span className="availability-summary-icon alert"><AlertTriangle aria-hidden="true" /></span><span><small>Groups below reserve</small><strong>{belowReserveCount}</strong></span></article>
          <article><span className="availability-summary-icon okay"><Building2 aria-hidden="true" /></span><span><small>Nearby blood banks</small><strong>{matchingCenters.length}</strong></span></article>
        </div>

        <div className="availability-toolbar">
          <span className="availability-filter-label"><SlidersHorizontal aria-hidden="true" /> Filter stock status</span>
          <div className="availability-filter-buttons" role="group" aria-label="Filter inventory status">
            <button type="button" className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All groups <span>{stockByGroup.length}</span></button>
            <button type="button" className={filter === 'below-reserve' ? 'active' : ''} aria-pressed={filter === 'below-reserve'} onClick={() => setFilter('below-reserve')}>Below reserve <span>{belowReserveCount}</span></button>
            <button type="button" className={filter === 'in-range' ? 'active' : ''} aria-pressed={filter === 'in-range'} onClick={() => setFilter('in-range')}>In range <span>{stockByGroup.length - belowReserveCount}</span></button>
          </div>
        </div>

        {belowReserveCount > 0 && filter === 'all' && <div className="availability-alert" role="status"><AlertTriangle aria-hidden="true" /><span><strong>{belowReserveCount} blood {belowReserveCount === 1 ? 'group is' : 'groups are'} below reserve.</strong> Review availability with the listed blood banks.</span></div>}

        {statusFilteredGroups.length ? <div className="availability-grid">
          {statusFilteredGroups.map((item) => {
            const percent = item.reserve > 0 ? Math.min(Math.round((item.units / item.reserve) * 100), 100) : 0
            return <article className={`availability-card ${item.belowReserve ? 'critical' : 'healthy'}`} key={item.group}>
              <div className="availability-card-heading"><strong>{item.group}</strong><span className="availability-status">{item.belowReserve ? 'Below reserve' : 'In range'}</span></div>
              <div className="availability-count">{item.units.toLocaleString()} <span>units available</span></div>
              <div className="availability-progress" role="progressbar" aria-label={`${item.group} stock compared with reserve`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>
              <div className="availability-card-foot"><span>{item.belowReserve ? `${(item.reserve - item.units).toLocaleString()} units below reserve` : 'Reserve target met'}</span><span>Reserve {item.reserve.toLocaleString()}</span></div>
            </article>
          })}
        </div> : <div className="availability-empty"><Info aria-hidden="true" /><strong>No stock matches</strong><span>Try a different blood group, component, location, or status filter.</span></div>}

        <section className="availability-bank-section" aria-labelledby="availability-banks-title">
          <div className="availability-bank-heading"><div><p className="pulse-kicker">NEARBY BLOOD BANKS</p><h3 id="availability-banks-title">Banks with matching inventory</h3></div><span>{nearbyOnly ? `Within ${nearbyLimit} mi` : 'Sorted by distance'}</span></div>
          {matchingCenters.length ? <div className="availability-bank-list">{matchingCenters.map((center) => {
            const centerRecords = filteredRecords.filter((record) => record.centerId === center.id)
            const centerUnits = centerRecords.reduce((sum, record) => sum + record.units, 0)
            const centerBelowReserve = bloodGroups.some((group) => {
              const groupRows = centerRecords.filter((record) => record.group === group)
              const units = groupRows.reduce((sum, record) => sum + record.units, 0)
              const reserve = groupRows.reduce((sum, record) => sum + record.reserve, 0)
              return units > 0 && units < reserve
            })
            return <article className="availability-bank-card" key={center.id}>
              <span className="availability-bank-icon"><Building2 aria-hidden="true" /></span>
              <div className="availability-bank-copy"><strong>{center.name}</strong><span><MapPin aria-hidden="true" /> {center.city} · {center.distance} mi</span></div>
              <div className="availability-bank-stock"><strong>{centerUnits.toLocaleString()} units</strong><span className={centerBelowReserve ? 'attention' : ''}>{centerBelowReserve ? 'Some groups below reserve' : 'Stock in range'}</span></div>
            </article>
          })}</div> : <div className="availability-empty"><Info aria-hidden="true" /><strong>No nearby blood banks found</strong><span>Try a different city or turn off the nearby-only filter.</span></div>}
        </section>

        <p className="availability-footnote"><Info aria-hidden="true" /> Sample data only. Verify current units, component, expiry, and allocation through your organization&apos;s approved systems before making decisions.</p>
      </section>
    </section>
  )
}
