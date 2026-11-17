'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Activity, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, Check, ClipboardList, Clock3, Droplets, History, PackagePlus, RefreshCw, ShieldAlert } from 'lucide-react'
import { inventory } from '@/lib/blood-inventory'

const bloodGroups = ['O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+']
const components = ['Red blood cells', 'Platelets', 'Plasma', 'Whole blood'] as const
const componentShares = [0.4, 0.25, 0.25, 0.1]
type BloodComponent = (typeof components)[number]
type StockRow = { id: string; group: string; component: BloodComponent; units: number; reserved: number; quarantined: number }
type Transaction = { id: number; time: string; action: string; product: string; quantity: number; tone: 'positive' | 'negative' | 'neutral' }
type UpdateAction = 'add' | 'remove' | 'reserve' | 'release-reserved' | 'quarantine' | 'release-quarantined'

function splitUnits(total: number) {
  const split = componentShares.map((share) => Math.floor(total * share))
  for (let remainder = total - split.reduce((sum, value) => sum + value, 0), index = 0; remainder > 0; remainder -= 1, index += 1) split[index % split.length] += 1
  return split
}

function makeInitialStock(): StockRow[] {
  return inventory.flatMap((group) => splitUnits(group.units).map((units, index) => ({
    id: `${group.group}-${components[index]}`,
    group: group.group,
    component: components[index],
    units,
    reserved: Math.floor(units * 0.08),
    quarantined: Math.floor(units * 0.02),
  })))
}

const initialTransactions: Transaction[] = [
  { id: 1, time: 'Today, 09:42', action: 'Stock received', product: 'O− · Red blood cells', quantity: 12, tone: 'positive' },
  { id: 2, time: 'Today, 08:16', action: 'Units reserved', product: 'A+ · Platelets', quantity: 6, tone: 'neutral' },
  { id: 3, time: 'Yesterday, 16:50', action: 'Quality hold', product: 'AB− · Plasma', quantity: 2, tone: 'negative' },
  { id: 4, time: 'Yesterday, 14:22', action: 'Stock received', product: 'O+ · Whole blood', quantity: 18, tone: 'positive' },
]

const updateActions: { value: UpdateAction; label: string }[] = [
  { value: 'add', label: 'Receive available stock' },
  { value: 'remove', label: 'Remove available stock' },
  { value: 'reserve', label: 'Reserve available units' },
  { value: 'release-reserved', label: 'Release reserved units' },
  { value: 'quarantine', label: 'Quarantine available units' },
  { value: 'release-quarantined', label: 'Release quarantined units' },
]

function formatUnits(value: number) {
  return value.toLocaleString()
}

export default function BloodInventoryManagementView({ profileName }: { profileName: string }) {
  const [stock, setStock] = useState(makeInitialStock)
  const [transactions, setTransactions] = useState(initialTransactions)
  const [addGroup, setAddGroup] = useState('O−')
  const [addComponent, setAddComponent] = useState<BloodComponent>('Red blood cells')
  const [addUnits, setAddUnits] = useState('1')
  const [addStatus, setAddStatus] = useState<'available' | 'reserved' | 'quarantined'>('available')
  const [updateGroup, setUpdateGroup] = useState('O−')
  const [updateComponent, setUpdateComponent] = useState<BloodComponent>('Red blood cells')
  const [updateAction, setUpdateAction] = useState<UpdateAction>('add')
  const [updateUnits, setUpdateUnits] = useState('1')
  const [componentFilter, setComponentFilter] = useState('')
  const [message, setMessage] = useState('')

  const totals = useMemo(() => stock.reduce((summary, row) => ({
    total: summary.total + row.units,
    reserved: summary.reserved + row.reserved,
    quarantined: summary.quarantined + row.quarantined,
  }), { total: 0, reserved: 0, quarantined: 0 }), [stock])
  const availableUnits = totals.total - totals.reserved - totals.quarantined

  const groupRows = useMemo(() => bloodGroups.map((group) => {
    const rows = stock.filter((row) => row.group === group && (!componentFilter || row.component === componentFilter))
    const base = inventory.find((item) => item.group === group)
    const shareIndex = componentFilter ? components.indexOf(componentFilter as BloodComponent) : -1
    const reserve = base ? shareIndex < 0 ? base.reserve : Math.floor(base.reserve * componentShares[shareIndex]) : 0
    const total = rows.reduce((sum, row) => sum + row.units, 0)
    const reserved = rows.reduce((sum, row) => sum + row.reserved, 0)
    const quarantined = rows.reduce((sum, row) => sum + row.quarantined, 0)
    return { group, total, reserved, quarantined, available: total - reserved - quarantined, reserve, low: total < reserve }
  }), [componentFilter, stock])

  const componentRows = useMemo(() => components.map((component) => {
    const rows = stock.filter((row) => row.component === component)
    const total = rows.reduce((sum, row) => sum + row.units, 0)
    const reserved = rows.reduce((sum, row) => sum + row.reserved, 0)
    const quarantined = rows.reduce((sum, row) => sum + row.quarantined, 0)
    return { component, total, reserved, quarantined, available: total - reserved - quarantined }
  }), [stock])

  const addNewUnit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const quantity = Number(addUnits)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      setMessage('Enter a whole number from 1 to 500 units.')
      return
    }
    setStock((current) => current.map((row) => row.group === addGroup && row.component === addComponent ? {
      ...row,
      units: row.units + quantity,
      reserved: row.reserved + (addStatus === 'reserved' ? quantity : 0),
      quarantined: row.quarantined + (addStatus === 'quarantined' ? quantity : 0),
    } : row))
    addTransaction(addStatus === 'available' ? 'Stock received' : addStatus === 'reserved' ? 'Reserved stock received' : 'Quarantined stock received', `${addGroup} · ${addComponent}`, quantity, addStatus === 'quarantined' ? 'negative' : 'positive')
    setMessage(`${quantity} ${addGroup} ${addComponent.toLowerCase()} ${quantity === 1 ? 'unit' : 'units'} added.`)
    setAddUnits('1')
  }

  const updateStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const quantity = Number(updateUnits)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      setMessage('Enter a whole number from 1 to 500 units.')
      return
    }
    const row = stock.find((item) => item.group === updateGroup && item.component === updateComponent)
    if (!row) return
    const available = row.units - row.reserved - row.quarantined
    const required = updateAction === 'remove' || updateAction === 'reserve' || updateAction === 'quarantine' ? available : updateAction === 'release-reserved' ? row.reserved : updateAction === 'release-quarantined' ? row.quarantined : Infinity
    if (quantity > required) {
      setMessage(`Only ${formatUnits(required === Infinity ? 500 : required)} units are eligible for this update.`)
      return
    }
    setStock((current) => current.map((item) => {
      if (item.id !== row.id) return item
      if (updateAction === 'add') return { ...item, units: item.units + quantity }
      if (updateAction === 'remove') return { ...item, units: item.units - quantity }
      if (updateAction === 'reserve') return { ...item, reserved: item.reserved + quantity }
      if (updateAction === 'release-reserved') return { ...item, reserved: item.reserved - quantity }
      if (updateAction === 'quarantine') return { ...item, quarantined: item.quarantined + quantity }
      return { ...item, quarantined: item.quarantined - quantity }
    }))
    const action = updateActions.find((item) => item.value === updateAction)?.label ?? 'Stock updated'
    const tone = updateAction === 'add' || updateAction === 'release-reserved' || updateAction === 'release-quarantined' ? 'positive' : updateAction === 'remove' || updateAction === 'quarantine' ? 'negative' : 'neutral'
    addTransaction(action, `${updateGroup} · ${updateComponent}`, quantity, tone)
    setMessage(`${action} · ${quantity} ${quantity === 1 ? 'unit' : 'units'} updated.`)
    setUpdateUnits('1')
  }

  function addTransaction(action: string, product: string, quantity: number, tone: Transaction['tone']) {
    setTransactions((current) => [{ id: Date.now(), time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), action, product, quantity, tone }, ...current].slice(0, 12))
  }

  return (
    <section className="pulse-overview blood-inventory-management" aria-labelledby="blood-inventory-management-title">
      <header className="pulse-overview-heading">
        <div><p className="pulse-kicker"><span className="pulse-kicker-dot" /> BLOOD BANK OPERATIONS</p><h1 id="blood-inventory-management-title">Blood Inventory Management</h1><p className="pulse-intro">Track available, reserved, and quarantined stock by blood group and component.</p></div>
        <span className="pulse-ai-chip"><Droplets aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Changes are held in this demo session only. Confirm all stock transactions in your organization&apos;s approved inventory system.</div>

      <section className="blood-inventory-section" aria-labelledby="inventory-total-title">
        <div className="blood-inventory-section-heading"><div><p className="pulse-kicker">OVERVIEW</p><h2 id="inventory-total-title">View Total Inventory</h2><p>Current sample stock across all blood groups and components.</p></div><span className="blood-inventory-updated"><Activity aria-hidden="true" /> Updated just now</span></div>
        <div className="blood-inventory-stats">
          <article className="blood-inventory-stat total"><span className="blood-inventory-stat-icon"><Boxes aria-hidden="true" /></span><span><small>Total inventory</small><strong>{formatUnits(totals.total)}</strong><em>units across 8 blood groups</em></span></article>
          <article className="blood-inventory-stat available"><span className="blood-inventory-stat-icon"><Check aria-hidden="true" /></span><span><small>Available units</small><strong>{formatUnits(availableUnits)}</strong><em>Ready for allocation</em></span></article>
          <article className="blood-inventory-stat reserved"><span className="blood-inventory-stat-icon"><ClipboardList aria-hidden="true" /></span><span><small>Reserved units</small><strong>{formatUnits(totals.reserved)}</strong><em>Held for requests</em></span></article>
          <article className="blood-inventory-stat quarantined"><span className="blood-inventory-stat-icon"><ShieldAlert aria-hidden="true" /></span><span><small>Quarantined units</small><strong>{formatUnits(totals.quarantined)}</strong><em>Unavailable pending review</em></span></article>
        </div>
      </section>

      <section className="blood-inventory-forms" aria-label="Inventory actions">
        <section className="blood-inventory-section blood-inventory-form-panel" aria-labelledby="add-unit-title">
          <div className="blood-inventory-section-heading"><div><p className="pulse-kicker">RECEIVING</p><h2 id="add-unit-title">Add New Blood Unit</h2></div><span className="blood-inventory-action-icon"><PackagePlus aria-hidden="true" /></span></div>
          <form className="blood-inventory-form" onSubmit={addNewUnit}>
            <label>Blood group<select value={addGroup} onChange={(event) => setAddGroup(event.target.value)}>{bloodGroups.map((group) => <option key={group}>{group}</option>)}</select></label>
            <label>Blood component<select value={addComponent} onChange={(event) => setAddComponent(event.target.value as BloodComponent)}>{components.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="blood-inventory-form-row"><label>Units<input type="number" min="1" max="500" step="1" value={addUnits} onChange={(event) => setAddUnits(event.target.value)} required /></label><label>Initial status<select value={addStatus} onChange={(event) => setAddStatus(event.target.value as typeof addStatus)}><option value="available">Available</option><option value="reserved">Reserved</option><option value="quarantined">Quarantined</option></select></label></div>
            <button className="blood-inventory-submit" type="submit"><PackagePlus aria-hidden="true" /> Add units</button>
          </form>
        </section>

        <section className="blood-inventory-section blood-inventory-form-panel" aria-labelledby="update-stock-title">
          <div className="blood-inventory-section-heading"><div><p className="pulse-kicker">STOCK CONTROL</p><h2 id="update-stock-title">Update Blood Stock</h2></div><span className="blood-inventory-action-icon"><RefreshCw aria-hidden="true" /></span></div>
          <form className="blood-inventory-form" onSubmit={updateStock}>
            <div className="blood-inventory-form-row"><label>Blood group<select value={updateGroup} onChange={(event) => setUpdateGroup(event.target.value)}>{bloodGroups.map((group) => <option key={group}>{group}</option>)}</select></label><label>Component<select value={updateComponent} onChange={(event) => setUpdateComponent(event.target.value as BloodComponent)}>{components.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            <label>Update action<select value={updateAction} onChange={(event) => setUpdateAction(event.target.value as UpdateAction)}>{updateActions.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}</select></label>
            <div className="blood-inventory-form-row"><label>Units<input type="number" min="1" max="500" step="1" value={updateUnits} onChange={(event) => setUpdateUnits(event.target.value)} required /></label><button className="blood-inventory-submit" type="submit"><RefreshCw aria-hidden="true" /> Apply update</button></div>
          </form>
        </section>
      </section>

      {message && <p className="blood-inventory-feedback" role="status">{message}</p>}

      <section className="blood-inventory-section" aria-labelledby="group-inventory-title">
        <div className="blood-inventory-section-heading"><div><p className="pulse-kicker">STOCK BREAKDOWN</p><h2 id="group-inventory-title">Blood Group-wise Inventory</h2><p>Available, reserved, and quarantined units by blood group.</p></div><label className="blood-inventory-filter">Component<select value={componentFilter} onChange={(event) => setComponentFilter(event.target.value)}><option value="">All components</option>{components.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <div className="blood-inventory-table-wrap"><table className="blood-inventory-table"><thead><tr><th scope="col">Blood group</th><th scope="col">Total units</th><th scope="col">Available</th><th scope="col">Reserved</th><th scope="col">Quarantined</th><th scope="col">Stock status</th></tr></thead><tbody>{groupRows.map((row) => <tr key={row.group}><th scope="row"><span className="blood-group-mark">{row.group}</span></th><td>{formatUnits(row.total)}</td><td className="stock-available-cell">{formatUnits(row.available)}</td><td>{formatUnits(row.reserved)}</td><td>{formatUnits(row.quarantined)}</td><td><span className={`blood-inventory-status${row.low ? ' low' : ''}`}>{row.low ? 'Below reserve' : 'In range'}</span></td></tr>)}</tbody></table></div>
      </section>

      <section className="blood-inventory-section" aria-labelledby="component-inventory-title">
        <div className="blood-inventory-section-heading"><div><p className="pulse-kicker">PRODUCT MIX</p><h2 id="component-inventory-title">Component-wise Inventory</h2><p>Stock totals across the current blood-component categories.</p></div></div>
        <div className="blood-component-grid">{componentRows.map((row) => <article className="blood-component-card" key={row.component}><span className="blood-component-icon"><Droplets aria-hidden="true" /></span><div><strong>{row.component}</strong><small>{formatUnits(row.total)} total units</small></div><div className="blood-component-counts"><span><strong>{formatUnits(row.available)}</strong><small>Available</small></span><span><strong>{formatUnits(row.reserved)}</strong><small>Reserved</small></span><span><strong>{formatUnits(row.quarantined)}</strong><small>Quarantined</small></span></div></article>)}</div>
      </section>

      <section className="blood-inventory-section" aria-labelledby="transaction-history-title">
        <div className="blood-inventory-section-heading"><div><p className="pulse-kicker">AUDIT TRAIL · DEMO</p><h2 id="transaction-history-title">Inventory Transaction History</h2><p>Recent receipts, reservations, releases, and stock adjustments.</p></div><span className="blood-inventory-action-icon"><History aria-hidden="true" /></span></div>
        <div className="blood-transaction-list">{transactions.map((transaction) => <article className="blood-transaction-row" key={transaction.id}><span className={`blood-transaction-icon ${transaction.tone}`}>{transaction.tone === 'positive' ? <ArrowDownToLine aria-hidden="true" /> : transaction.tone === 'negative' ? <ArrowUpFromLine aria-hidden="true" /> : <ClipboardList aria-hidden="true" />}</span><div className="blood-transaction-copy"><strong>{transaction.action}</strong><span>{transaction.product}</span></div><span className={`blood-transaction-quantity ${transaction.tone}`}>{transaction.tone === 'negative' ? '−' : '+'}{formatUnits(transaction.quantity)} units</span><time><Clock3 aria-hidden="true" /> {transaction.time}</time></article>)}</div>
        <p className="blood-inventory-footnote"><AlertTriangle aria-hidden="true" /> Transaction history is illustrative and resets when this demo view reloads.</p>
      </section>
    </section>
  )
}
