'use client'

import { useState } from 'react'
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Inbox,
  LayoutDashboard,
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
  { label: 'Inbox', icon: Inbox, badge: '12' },
  { label: 'Customers', icon: Users },
]
const workspaceItems = [
  { label: 'Analytics', icon: BarChart3 },
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
  { id: '#QX-1048', message: 'Can’t access my account', category: 'Authentication', department: 'Support', priority: 'High', reasoning: 'Login failure detected', status: 'Open' },
  { id: '#QX-1047', message: 'Question about my invoice', category: 'Billing', department: 'Finance', priority: 'Normal', reasoning: 'Invoice clarification', status: 'In progress' },
  { id: '#QX-1046', message: 'Feature request: dark mode', category: 'Feedback', department: 'Product', priority: 'Low', reasoning: 'Product suggestion', status: 'Review' },
  { id: '#QX-1045', message: 'Order still says pending', category: 'Order status', department: 'Operations', priority: 'Normal', reasoning: 'Fulfillment delay', status: 'Resolved' },
  { id: '#QX-1044', message: 'Refund has not arrived yet', category: 'Refunds', department: 'Finance', priority: 'High', reasoning: 'Payment follow-up', status: 'Open' },
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

  const selectItem = (label: string) => {
    setActive(label)
    setCatalogueBlur(true)
    window.setTimeout(() => setCatalogueBlur(false), 340)
    setSidebarOpen(false)
  }

  return (
    <main className={`app-shell text-style-${textStyle.toLowerCase()}`}>
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
          <NavGroup title="Main" items={mainItems} active={active} onSelect={selectItem} />
          <NavGroup title="Workspace & Website chats" items={workspaceItems} active={active} onSelect={selectItem} />
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
          {active === 'Analytics' ? <AnalyticsView tickets={analyticsTickets} onAdd={(ticket) => setAnalyticsTickets((current) => [ticket, ...current])} onUpdate={(id, status) => setAnalyticsTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket))} /> : <>
          <section className="hero-card glass-panel">
            <div className="hero-copy"><h2>Every conversation,<br /><em>understood.</em></h2><p>Lucent sorts, prioritizes, and routes every incoming ticket so your team can focus on what matters.</p><div className="hero-metrics" aria-label="Overview metrics"><div><strong>142</strong><span>Tickets sorted</span></div><div><strong>94.6%</strong><span>Lucent accuracy</span></div><div><strong>14m</strong><span>Average accuracy time</span></div></div></div>
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

function AnalyticsView({ tickets, onAdd, onUpdate }: { tickets: AnalyticsTicket[]; onAdd: (ticket: AnalyticsTicket) => void; onUpdate: (id: string, status: string) => void }) {
  const addDemoTicket = () => onAdd({ id: `#QX-${1050 + tickets.length}`, message: 'Demo ticket: delivery update needed', category: 'Order status', department: 'Operations', priority: 'Normal', reasoning: 'Demo classification added', status: 'Open' })

  return <section className="analytics-view glass-panel" aria-labelledby="analytics-title">
    <div className="analytics-heading"><div><p className="eyebrow">Workspace insights</p><h2 id="analytics-title">Ticket analytics</h2><p>Review every classified conversation and update its status in place.</p></div><div className="analytics-actions"><span className="analytics-count">{tickets.length} tickets</span><button className="demo-ticket-button" onClick={addDemoTicket}>+ Add demo ticket</button></div></div>
    <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>ID</th><th>Customer message</th><th>Category</th><th>Department</th><th>Priority</th><th>Reasoning</th><th>Status</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket.id}><td className="ticket-id">{ticket.id}</td><td className="message-cell">{ticket.message}</td><td>{ticket.category}</td><td>{ticket.department}</td><td><span className={`table-priority ${ticket.priority.toLowerCase()}`}><i />{ticket.priority}</span></td><td className="reasoning-cell">{ticket.reasoning}</td><td><select className={`table-status-select ${ticket.status.toLowerCase().replace(' ', '-')}`} value={ticket.status} onChange={(event) => onUpdate(ticket.id, event.target.value)} aria-label={`Update status for ${ticket.id}`}><option>Open</option><option>In progress</option><option>Review</option><option>Resolved</option></select></td></tr>)}</tbody></table></div>
  </section>
}

function NavGroup({ title, items, active, onSelect }: { title: string; items: { label: string; icon: typeof Inbox; badge?: string }[]; active: string; onSelect: (label: string) => void }) {
  return <div className="nav-group"><p className="nav-label">{title}</p>{items.map(({ label, icon: Icon, badge }) => <button className={`nav-item ${active === label ? 'active' : ''}`} key={label} onClick={() => onSelect(label)}><Icon /><span>{label}</span>{badge && <b className="nav-badge">{badge}</b>}</button>)}</div>
}
function StatCard({ label, value, delta, icon: Icon, positive }: { label: string; value: string; delta: string; icon: typeof Inbox; positive?: boolean }) { return <div className="stat-card glass-panel"><div className="stat-icon"><Icon /></div><div><span>{label}</span><div className="stat-value">{value} <small className={positive ? 'positive' : ''}>{positive ? '↑' : '↑'} {delta}</small></div></div></div> }
function Legend({ label, value, color }: { label: string; value: string; color: string }) { return <div className="legend-row"><span><i className={color} />{label}</span><b>{value}</b></div> }
