'use client'

import { useMemo, useState } from 'react'
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Legend as RechartsLegend, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Check,
  CircleHelp,
  Clock3,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Settings2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

const mainItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Inbox', icon: Inbox },
  { label: 'Customers', icon: Users },
]
const workspaceItems = [
  { label: 'Analytics', icon: BarChart3 },
  { label: 'All Tickets', icon: ListTodo },
  { label: 'Integrations', icon: Settings2 },
]
const channelItems = [
  { label: 'Website chats', icon: MessageCircle },
  { label: 'E-mail', icon: CircleHelp },
  { label: 'WhatsApp', icon: MessageCircle },
]

const tickets = [
  { initials: 'SL', name: 'Sofia Lawrence', subject: 'Can’t access my account', time: '2m ago', tag: 'Login issue', tone: 'coral', priority: 'High' },
  { initials: 'MR', name: 'Marcus Reed', subject: 'Question about my invoice', time: '18m ago', tag: 'Billing', tone: 'violet', priority: 'Normal' },
  { initials: 'AV', name: 'Amelia Vance', subject: 'Feature request: dark mode', time: '34m ago', tag: 'Feedback', tone: 'blue', priority: 'Low' },
  { initials: 'JP', name: 'James Park', subject: 'Order still says pending', time: '1h ago', tag: 'Order status', tone: 'amber', priority: 'Normal' },
]

const initialAnalyticsTickets = [
  { id: '#QX-1048', message: 'Can’t access my account', category: 'Authentication', department: 'Support', priority: 'High', confidence: '98%', reasoning: 'Login failure detected', status: 'Open', action: 'Assign to support' },
  { id: '#QX-1047', message: 'Question about my invoice', category: 'Billing', department: 'Finance', priority: 'Normal', confidence: '94%', reasoning: 'Invoice clarification', status: 'In progress', action: 'Review reply' },
  { id: '#QX-1046', message: 'Feature request: dark mode', category: 'Feedback', department: 'Product', priority: 'Low', confidence: '89%', reasoning: 'Product suggestion', status: 'Review', action: 'Send to product' },
  { id: '#QX-1045', message: 'Order still says pending', category: 'Order status', department: 'Operations', priority: 'Normal', confidence: '96%', reasoning: 'Fulfillment delay', status: 'Resolved', action: 'No action needed' },
  { id: '#QX-1044', message: 'Refund has not arrived yet', category: 'Refunds', department: 'Finance', priority: 'High', confidence: '92%', reasoning: 'Payment follow-up', status: 'Open', action: 'Escalate to finance' },
]
type AnalyticsTicket = (typeof initialAnalyticsTickets)[number]

export default function Page() {
  const [active, setActive] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [catalogueBlur, setCatalogueBlur] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileName, setProfileName] = useState('Jordan Davis')
  const [occupation, setOccupation] = useState('Support Admin')
  const [textStyle, setTextStyle] = useState('Modern')
  const [analyticsTickets, setAnalyticsTickets] = useState<AnalyticsTicket[]>(initialAnalyticsTickets)
  const [demoMode, setDemoMode] = useState(false)
  const [demoDialogOpen, setDemoDialogOpen] = useState(false)
  const [demoQuery, setDemoQuery] = useState('')
  const [actionTicket, setActionTicket] = useState<AnalyticsTicket | null>(null)
  const [humanOverrideNotice, setHumanOverrideNotice] = useState(false)

  const confirmHumanOverride = () => {
    if (actionTicket) setAnalyticsTickets((current) => current.filter((ticket) => ticket.id !== actionTicket.id))
    setHumanOverrideNotice(true)
    setActionTicket(null)
    window.setTimeout(() => setHumanOverrideNotice(false), 3200)
  }

  const addDemoTicket = (message: string) => {
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    setAnalyticsTickets((current) => [{ id: `#QX-${1050 + current.length}`, message: cleanMessage, category: 'General inquiry', department: 'Support', priority: 'Normal', confidence: '91%', reasoning: 'Demo query classified in real time', status: 'Open', action: 'Assign to support' }, ...current])
    setActive('Analytics')
    setDemoQuery('')
    setDemoDialogOpen(false)
  }
  const toggleDemoMode = () => {
    setDemoMode((enabled) => {
      const nextEnabled = !enabled
      setDemoDialogOpen(nextEnabled)
      return nextEnabled
    })
  }

  const selectItem = (label: string) => {
    setActive(label)
    setCatalogueBlur(true)
    window.setTimeout(() => setCatalogueBlur(false), 340)
    setSidebarOpen(false)
  }

  return (
    <main className={`app-shell text-style-${textStyle.toLowerCase()} ${demoDialogOpen ? 'demo-open' : ''}`}>
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="mobile-topbar glass-panel">
        <button className="icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu /></button>
        <div className="brand-mark small"><Sparkles /></div>
        <span className="mobile-title">Main</span>
        <button className="icon-button" aria-label="Notifications"><Bell /></button>
      </div>

      <aside className={`sidebar glass-panel ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header sidebar-header-minimal">
          <button className="icon-button close-sidebar" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>
        <button className="profile-panel glass-inset" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
          <div className="avatar user-avatar">{profileName.split(' ').map((part) => part[0]).join('')}</div>
          <div className="workspace-copy"><strong>{profileName}</strong><span>{occupation}</span></div><ChevronDown className={profileOpen ? 'profile-chevron-open' : ''} />
        </button>
        {profileOpen && <div className="profile-settings glass-panel">
          <p className="profile-settings-title">Profile settings</p>
          <label>Name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} /></label>
          <label>Occupation<input value={occupation} onChange={(event) => setOccupation(event.target.value)} /></label>
          <fieldset><legend>Text style</legend><div className="text-style-options">{['Modern', 'Classic', 'Friendly'].map((style) => <button type="button" key={style} className={textStyle === style ? 'selected' : ''} onClick={() => setTextStyle(style)}>{style}</button>)}</div></fieldset>
        </div>}
        <nav className="sidebar-nav" aria-label="Primary navigation">
          <NavGroup title="Main" items={mainItems.map((item) => item.label === 'Inbox' ? { ...item, badge: String(analyticsTickets.filter((ticket) => Number.parseInt(ticket.confidence, 10) < 90).length) } : item)} active={active} onSelect={selectItem} />
          <NavGroup title="Workspace &amp; Website chats" items={workspaceItems} active={active} onSelect={selectItem} />
          <NavGroup title="Channels" items={channelItems} active={active} onSelect={selectItem} />
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => selectItem('Knowledge base')}><BookOpen /> <span>Knowledge base</span></button>
          <div className="usage-card glass-inset"><div className="usage-top"><span>AI triage usage</span><span>78%</span></div><div className="usage-bar"><span /></div><p>1,560 of 2,000 tickets classified</p></div>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <section className="content-area">
        <div className="qunexa-topbar" aria-label="Qunexa workspace header">
          <div className="qunexa-cylinder"><span>QUNEXA</span></div>
        </div>
        <div className={`dashboard-content ${catalogueBlur ? 'catalogue-blur' : ''}`}>
          {active === 'Inbox' ? <><InboxView tickets={analyticsTickets.filter((ticket) => Number.parseInt(ticket.confidence, 10) < 90)} onActionClick={setActionTicket} />{humanOverrideNotice && <div className="override-notice" role="status"><span className="override-notice-icon"><Check /></span><span><strong>Issue has been resolved with human override</strong><small>The ticket has been removed from the inbox.</small></span><button type="button" aria-label="Dismiss notification" onClick={() => setHumanOverrideNotice(false)}><X /></button></div>}{actionTicket && <ActionDialog ticket={actionTicket} onClose={() => setActionTicket(null)} onConfirm={confirmHumanOverride} />}</> : active === 'Analytics' ? <><AnalyticsView title="Ticket analytics" tickets={analyticsTickets} onUpdate={() => undefined} onActionClick={setActionTicket} />{humanOverrideNotice && <div className="override-notice" role="status"><span className="override-notice-icon"><Check /></span><span><strong>Issue has been resolved with human override</strong><small>The ticket has been updated and routed for human review.</small></span><button type="button" aria-label="Dismiss notification" onClick={() => setHumanOverrideNotice(false)}><X /></button></div>}{actionTicket && <div className="action-dialog-backdrop" role="presentation" onMouseDown={() => setActionTicket(null)}><div className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="action-dialog-title" onMouseDown={(event) => event.stopPropagation()}><button className="demo-dialog-close" type="button" aria-label="Close action details" onClick={() => setActionTicket(null)}><X /></button><p className="eyebrow">Human action</p><h3 id="action-dialog-title">{Number.parseInt(actionTicket.confidence, 10) < 90 ? 'Action required' : 'Action not required'}</h3><p className="action-dialog-message">{actionTicket.message}</p><dl className="action-dialog-details"><div><dt>Ticket</dt><dd>{actionTicket.id}</dd></div><div><dt>AI confidence</dt><dd>{actionTicket.confidence}</dd></div><div><dt>Reasoning</dt><dd>{actionTicket.reasoning}</dd></div><div><dt>Human override</dt><dd>Fix with human override</dd></div></dl><div className="action-dialog-actions"><button className="text-button" type="button" onClick={() => setActionTicket(null)}>No, keep automated</button><button className="demo-submit override-confirm" type="button" onClick={confirmHumanOverride}>Yes, fix it</button></div></div></div>}</> : active === 'All Tickets' ? <>{humanOverrideNotice && <div className="override-notice" role="status"><span className="override-notice-icon"><Check /></span><span><strong>Issue has been resolved with human override</strong><small>The ticket has been updated and routed for human review.</small></span><button type="button" aria-label="Dismiss notification" onClick={() => setHumanOverrideNotice(false)}><X /></button></div>}<TicketTable tickets={analyticsTickets} onActionClick={setActionTicket} />{actionTicket && <div className="action-dialog-backdrop" role="presentation" onMouseDown={() => setActionTicket(null)}><div className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="all-tickets-action-title" onMouseDown={(event) => event.stopPropagation()}><button className="demo-dialog-close" type="button" aria-label="Close action details" onClick={() => setActionTicket(null)}><X /></button><p className="eyebrow">Human action</p><h3 id="all-tickets-action-title">Action required</h3><p className="action-dialog-message">{actionTicket.message}</p><dl className="action-dialog-details"><div><dt>Ticket</dt><dd>{actionTicket.id}</dd></div><div><dt>AI confidence</dt><dd>{actionTicket.confidence}</dd></div><div><dt>Fix</dt><dd>Fix with human override</dd></div></dl><div className="action-dialog-actions"><button className="text-button" type="button" onClick={() => setActionTicket(null)}>Cancel</button><button className="demo-submit override-confirm" type="button" onClick={confirmHumanOverride}>Yes, fix it</button></div></div></div>}</> : <>
          <section className="hero-card glass-panel">
            <div className="hero-copy">
              <h2>Every conversation,<br /><em>understood.</em></h2>
              <p>Lucent sorts, prioritizes, and routes every incoming ticket so your team can focus on what matters.</p>
              <div className="hero-metrics" aria-label="Overview metrics">
                <div><strong>142</strong><span>Tickets sorted</span></div>
                <div><strong>94.6%</strong><span>Lucent accuracy</span></div>
                <div><strong>14m</strong><span>Average accuracy time</span></div>
                <button className={`demo-ticket-button hero-demo-button demo-toggle ${demoMode ? 'is-on' : ''}`} type="button" role="switch" aria-checked={demoMode} onClick={toggleDemoMode}><span className="demo-toggle-track" aria-hidden="true"><span /></span><span>{demoMode ? 'Demo mode on' : 'Demo mode off'}</span></button>
              </div>
              {demoDialogOpen && <div className="demo-dialog-backdrop" role="presentation" onMouseDown={() => setDemoDialogOpen(false)}><div className="demo-dialog glass-panel" role="dialog" aria-modal="true" aria-labelledby="demo-dialog-title" onMouseDown={(event) => event.stopPropagation()}><button className="demo-dialog-close" type="button" aria-label="Close demo query" onClick={() => setDemoDialogOpen(false)}><X /></button><p className="eyebrow">Live demo mode</p><h3 id="demo-dialog-title">Add a customer query</h3><p>Enter a message and watch it appear at the top of Analytics.</p><form onSubmit={(event) => { event.preventDefault(); addDemoTicket(demoQuery) }}><label htmlFor="demo-query">Customer message</label><textarea id="demo-query" value={demoQuery} onChange={(event) => setDemoQuery(event.target.value)} placeholder="e.g. Where is my latest order?" autoFocus /><div className="demo-dialog-actions"><button className="text-button" type="button" onClick={() => setDemoDialogOpen(false)}>Cancel</button><button className="demo-submit" type="submit" disabled={!demoQuery.trim()}>Classify query</button></div></form></div></div>}
            </div>
            <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="lucent-logo"><span>L</span></div></div>
          </section>

          <div className="stats-grid"><StatCard label="Open tickets" value="128" delta="12.5%" icon={Inbox} /><StatCard label="Avg. response time" value="14m" delta="8.2%" icon={Clock3} positive /><StatCard label="Resolution rate" value="86.4%" delta="4.8%" icon={Sparkles} positive /></div>

          <section className="lower-grid">
            <div className="tickets-card glass-panel"><div className="section-heading"><div><p className="eyebrow">Needs your attention</p><h3>Recent tickets</h3></div><button className="text-button" onClick={() => selectItem('Inbox')}>View all <ChevronRight /></button></div><div className="ticket-list">{tickets.map((ticket) => <button className="ticket-row" key={ticket.name} onClick={() => selectItem('Inbox')}><div className={`avatar ticket-avatar ${ticket.tone}`}>{ticket.initials}</div><div className="ticket-main"><strong>{ticket.subject}</strong><span>{ticket.name} · {ticket.time}</span></div><span className={`ticket-tag ${ticket.tone}`}>{ticket.tag}</span><span className={`priority ${ticket.priority.toLowerCase()}`}><i />{ticket.priority}</span><ChevronRight className="row-arrow" /></button>)}</div></div>
            <div className="channels-card glass-panel"><div className="section-heading"><div><p className="eyebrow">Live overview</p><h3>By channel</h3></div><button className="icon-button"><MoreHorizontal /></button></div><div className="donut-wrap"><div className="donut"><div className="donut-center"><strong>642</strong><span>this week</span></div></div><div className="channel-legend"><Legend label="Website chats" value="48%" color="pink" /><Legend label="E-mail" value="32%" color="purple" /><Legend label="WhatsApp" value="20%" color="blue" /></div></div><div className="mini-insight"><Sparkles /><span>Website chats are up <b>24%</b> this week</span></div></div>
          </section>
          </>}
        </div>
        <footer className="content-footer"><span>Lucent AI is learning from your team’s resolutions.</span><button className="help-button"><CircleHelp /> Need help?</button></footer>
      </section>
    </main>
  )
}

function InboxView({ tickets, onActionClick }: { tickets: AnalyticsTicket[]; onActionClick: (ticket: AnalyticsTicket) => void }) {
  return <section className="inbox-view glass-panel"><div className="analytics-heading"><div><p className="eyebrow">Human attention</p><h2>Inbox</h2><p>Tickets waiting for a human action. Resolved issues leave this list automatically.</p></div><span className="analytics-count">{tickets.length} action required</span></div>{tickets.length ? <div className="inbox-list">{tickets.map((ticket) => <button className="inbox-ticket" key={ticket.id} type="button" onClick={() => onActionClick(ticket)}><span className="inbox-ticket-copy"><strong>{ticket.message}</strong><small>{ticket.id} · {ticket.category} · {ticket.confidence} confidence</small></span><span className="human-action-badge required">Action required</span><ChevronRight /></button>)}</div> : <div className="inbox-empty"><span className="override-notice-icon"><Check /></span><div><strong>Inbox is clear</strong><p>All human-action issues have been resolved.</p></div></div>}</section>
}

function ActionDialog({ ticket, onClose, onConfirm }: { ticket: AnalyticsTicket; onClose: () => void; onConfirm: () => void }) {
  return <div className="action-dialog-backdrop" role="presentation" onMouseDown={onClose}><div className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="inbox-action-title" onMouseDown={(event) => event.stopPropagation()}><button className="demo-dialog-close" type="button" aria-label="Close action details" onClick={onClose}><X /></button><p className="eyebrow">Human action</p><h3 id="inbox-action-title">Action required</h3><p className="action-dialog-message">{ticket.message}</p><dl className="action-dialog-details"><div><dt>Ticket</dt><dd>{ticket.id}</dd></div><div><dt>AI confidence</dt><dd>{ticket.confidence}</dd></div><div><dt>Fix</dt><dd>Fix with human override</dd></div></dl><div className="action-dialog-actions"><button className="text-button" type="button" onClick={onClose}>Cancel</button><button className="demo-submit override-confirm" type="button" onClick={onConfirm}>Yes, fix it</button></div></div></div>
}

function TicketTable({ tickets, onActionClick }: { tickets: AnalyticsTicket[]; onActionClick: (ticket: AnalyticsTicket) => void }) {
  return <section className="analytics-view glass-panel" aria-labelledby="all-tickets-title"><div className="analytics-heading"><div><p className="eyebrow">Workspace tickets</p><h2 id="all-tickets-title">All tickets</h2><p>Review every classified conversation and its current status.</p></div><span className="analytics-count">{tickets.length} tickets</span></div><div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>ID</th><th>Customer message</th><th>Category</th><th>Department</th><th>Priority</th><th>AI confidence</th><th>Reasoning</th><th>Status</th><th>Human action</th></tr></thead><tbody>{tickets.map((ticket) => { const actionRequired = Number.parseInt(ticket.confidence, 10) < 90; return <tr key={ticket.id}><td className="ticket-id">{ticket.id}</td><td className="message-cell">{ticket.message}</td><td>{ticket.category}</td><td>{ticket.department}</td><td><span className={`table-priority ${ticket.priority.toLowerCase()}`}><i />{ticket.priority}</span></td><td className="confidence-cell">{ticket.confidence}</td><td className="reasoning-cell">{ticket.reasoning}</td><td><span className={`table-status-select ${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span></td><td className="human-action-cell"><button type="button" className={`human-action-badge ${actionRequired ? 'required' : 'not-required'}`} onClick={() => onActionClick(ticket)}>{actionRequired ? 'Action required' : 'Action not required'}</button></td></tr>})}</tbody></table></div></section>
}

function AnalyticsView({ title, tickets }: { title: string; tickets: AnalyticsTicket[]; onUpdate: (id: string, status: string) => void; onActionClick: (ticket: AnalyticsTicket) => void }) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const chartData = useMemo(() => Object.entries(tickets.reduce<Record<string, number>>((counts, ticket) => { counts[ticket.category] = (counts[ticket.category] ?? 0) + 1; return counts }, {} )).map(([category, count]) => ({ category, value: count })), [tickets])
  const colors = ['#5968df', '#83a7c8', '#d9a85d', '#9a7bc1', '#6bb18b']
  return <section className="analytics-view glass-panel" aria-labelledby="analytics-title">
    <div className="analytics-heading"><div><p className="eyebrow">Workspace insights</p><h2 id="analytics-title">{title}</h2><p>Track classified conversations by category with a live visual summary.</p></div><div className="analytics-actions"><span className="analytics-count">{tickets.length} tickets</span></div></div>
    <div className="chart-toolbar" role="group" aria-label="Chart type"><span>View as</span>{(['bar', 'line', 'pie'] as const).map((type) => <button key={type} type="button" className={`chart-toggle ${chartType === type ? 'active' : ''}`} onClick={() => setChartType(type)}>{type === 'bar' ? 'Bar chart' : type === 'line' ? 'Line chart' : 'Pie chart'}</button>)}</div>
    <div className="analytics-chart" aria-label={`${chartType} chart showing tickets by category`}>
      <ResponsiveContainer width="100%" height="100%">{chartType === 'bar' ? <RechartsBarChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(112,126,157,.16)" /><XAxis dataKey="category" tick={{ fill: '#7b879b', fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#7b879b', fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.8)', background: '#fffdf1', fontSize: 11 }} /><Bar dataKey="value" name="Tickets" radius={[8, 8, 0, 0]} fill="#5968df" /></RechartsBarChart> : chartType === 'line' ? <RechartsLineChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(112,126,157,.16)" /><XAxis dataKey="category" tick={{ fill: '#7b879b', fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#7b879b', fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.8)', background: '#fffdf1', fontSize: 11 }} /><Line type="monotone" dataKey="value" name="Tickets" stroke="#5968df" strokeWidth={3} dot={{ r: 5, fill: '#5968df' }} /></RechartsLineChart> : <RechartsPieChart><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.8)', background: '#fffdf1', fontSize: 11 }} /><RechartsLegend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 10 }} /><Pie data={chartData} dataKey="value" nameKey="category" cx="50%" cy="45%" outerRadius="68%" paddingAngle={3}>{chartData.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}</Pie></RechartsPieChart>}</ResponsiveContainer>
    </div>
  </section>
}

function NavGroup({ title, items, active, onSelect }: { title: string; items: { label: string; icon: typeof Inbox; badge?: string }[]; active: string; onSelect: (label: string) => void }) {
  return <div className="nav-group">{title && <p className="nav-label">{title}</p>}{items.map(({ label, icon: Icon, badge }) => <button className={`nav-item ${active === label ? 'active' : ''}`} key={label} onClick={() => onSelect(label)}><Icon /><span>{label}</span>{badge && <b className="nav-badge">{badge}</b>}</button>)}</div>
}
function StatCard({ label, value, delta, icon: Icon, positive }: { label: string; value: string; delta: string; icon: typeof Inbox; positive?: boolean }) { return <div className="stat-card glass-panel"><div className="stat-icon"><Icon /></div><div><span>{label}</span><div className="stat-value">{value} <small className={positive ? 'positive' : ''}>{positive ? '↑' : '↑'} {delta}</small></div></div></div> }
function Legend({ label, value, color }: { label: string; value: string; color: string }) { return <div className="legend-row"><span><i className={color} />{label}</span><b>{value}</b></div> }
