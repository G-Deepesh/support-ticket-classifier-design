import { BellRing, ClipboardCheck, ShieldCheck, CalendarDays, Clock3, BookOpen } from 'lucide-react'

type EligibilityStatusViewProps = {
  profileName: string
}

const eligibilityCards = [
  {
    label: 'Current Eligibility Status',
    value: 'Not confirmed',
    note: 'Donation-center staff confirm eligibility after screening.',
    icon: ShieldCheck,
    tone: 'green',
  },
  {
    label: 'Next Possible Donation Date',
    value: 'Center review',
    note: 'Timing depends on your donation history and center guidance.',
    icon: CalendarDays,
    tone: 'blue',
  },
  {
    label: 'Donation Interval Information',
    value: 'Type-dependent',
    note: 'Follow the interval provided by your donation center.',
    icon: Clock3,
    tone: 'amber',
  },
  {
    label: 'Eligibility Guidelines',
    value: 'Center-specific',
    note: 'Requirements vary by location and donation type.',
    icon: BookOpen,
    tone: 'red',
  },
]

export default function EligibilityStatusView({ profileName }: EligibilityStatusViewProps) {
  return (
    <section className="pulse-overview" aria-labelledby="eligibility-status-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> DONOR SERVICES · ELIGIBILITY</p>
          <h1 id="eligibility-status-title">Eligibility Status</h1>
          <p className="pulse-intro">Review general donation guidance and confirm your personal status with your donation center.</p>
        </div>
        <span className="pulse-ai-chip"><ShieldCheck aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Guidance</span> Personal eligibility and donation timing must be confirmed by donation-center staff.</div>

      <section className="pulse-metric-grid" aria-label="Eligibility overview">
        {eligibilityCards.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="pulse-metric-card" key={label}>
            <div className="pulse-metric-top"><span>{label}</span><span className={`pulse-metric-icon ${tone}`}><Icon aria-hidden="true" /></span></div>
            <strong className="pulse-metric-value">{value}</strong>
            <div className="pulse-metric-foot"><span>{note}</span></div>
          </article>
        ))}
      </section>

      <div className="pulse-insight-grid">
        <section className="pulse-panel" aria-labelledby="health-declaration-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">BEFORE EACH VISIT</p><h2 id="health-declaration-title">Health Declaration</h2><p>Complete the current screening process provided by your donation center.</p></div>
          </div>
          <div className="pulse-match-callout"><ClipboardCheck aria-hidden="true" /><span><strong>Share health changes with staff</strong><small>Answer screening questions accurately and discuss any health concerns directly with the donation-center team.</small></span></div>
        </section>

        <section className="pulse-panel" aria-labelledby="eligibility-notifications-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">STAY INFORMED</p><h2 id="eligibility-notifications-title">Eligibility Notifications</h2><p>Check with your center for status updates and reminder options.</p></div>
          </div>
          <div className="pulse-match-callout"><BellRing aria-hidden="true" /><span><strong>No live notifications are connected</strong><small>This demo does not send screening or eligibility alerts. Contact your donation center for current updates.</small></span></div>
        </section>
      </div>
    </section>
  )
}
