'use client'

import { useState } from 'react'
import { BellRing, CalendarDays, CheckCircle2, Clock3, History, Mail, Smartphone } from 'lucide-react'

type PreferenceKey = 'email' | 'inApp' | 'emergency' | 'appointmentReminder' | 'donationReminder'
type Preferences = Record<PreferenceKey, boolean>

const initialPreferences: Preferences = {
  email: true,
  inApp: true,
  emergency: true,
  appointmentReminder: true,
  donationReminder: false,
}

const notificationHistory = [
  { title: 'Donation reminder preferences reviewed', detail: 'Sample activity · Appointment reminder', time: 'Nov 15, 2026 · 9:14 AM', icon: CalendarDays },
  { title: 'Emergency request alert', detail: 'Sample alert · O− request nearby', time: 'Nov 14, 2026 · 4:32 PM', icon: BellRing },
  { title: 'Donation reminder', detail: 'Sample reminder · Review your appointment details', time: 'Nov 12, 2026 · 11:05 AM', icon: CheckCircle2 },
]

export default function NotificationsView({ profileName }: { profileName: string }) {
  const [preferences, setPreferences] = useState(initialPreferences)

  const togglePreference = (key: PreferenceKey) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <section className="pulse-overview notifications-view" aria-labelledby="notifications-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> DONOR SERVICES · UPDATES</p>
          <h1 id="notifications-title">Notifications</h1>
          <p className="pulse-intro">Choose which updates you would like to see and review recent notification activity.</p>
        </div>
        <span className="pulse-ai-chip"><BellRing aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Preferences are preview-only, reset when you leave, and do not send real notifications.</div>

      <div className="notifications-grid">
        <section className="pulse-panel notification-panel" aria-labelledby="notification-preferences-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">DELIVERY CHANNELS</p><h2 id="notification-preferences-title">Donation Notification Preferences</h2><p>Manage the sample channels used for donor updates.</p></div>
          </div>
          <div className="notification-toggle-list">
            <PreferenceToggle icon={Mail} label="Email notifications" description="Updates sent to your sample email preference." enabled={preferences.email} onToggle={() => togglePreference('email')} />
            <PreferenceToggle icon={Smartphone} label="In-app notifications" description="Updates shown in your notification center." enabled={preferences.inApp} onToggle={() => togglePreference('inApp')} />
          </div>
        </section>

        <section className="pulse-panel notification-panel" aria-labelledby="emergency-alerts-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">TIME-SENSITIVE UPDATES</p><h2 id="emergency-alerts-title">Emergency Alerts</h2><p>Control sample alerts for urgent nearby requests.</p></div>
          </div>
          <div className="notification-toggle-list">
            <PreferenceToggle icon={BellRing} label="Emergency request alerts" description="Example alerts for urgent local blood requests." enabled={preferences.emergency} onToggle={() => togglePreference('emergency')} />
          </div>
          <div className="pulse-match-callout"><BellRing aria-hidden="true" /><span><strong>Confirm urgent needs with a center</strong><small>These demo alerts are not connected to live requests or emergency services.</small></span></div>
        </section>

        <section className="pulse-panel notification-panel" aria-labelledby="donation-reminders-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">PLAN AHEAD</p><h2 id="donation-reminders-title">Donation Reminders</h2><p>Choose which sample reminders appear in your dashboard.</p></div>
          </div>
          <div className="notification-toggle-list">
            <PreferenceToggle icon={CalendarDays} label="Appointment reminders" description="A reminder to review upcoming appointment details." enabled={preferences.appointmentReminder} onToggle={() => togglePreference('appointmentReminder')} />
            <PreferenceToggle icon={Clock3} label="General donation reminders" description="Occasional prompts to check with your donation center." enabled={preferences.donationReminder} onToggle={() => togglePreference('donationReminder')} />
          </div>
        </section>

        <section className="pulse-panel notification-panel" aria-labelledby="notification-history-title">
          <div className="pulse-section-heading">
            <div><p className="pulse-kicker">RECENT ACTIVITY</p><h2 id="notification-history-title">Notification History</h2><p>Illustrative examples of recent donor updates.</p></div>
            <span className="notification-history-count"><History aria-hidden="true" /> {notificationHistory.length}</span>
          </div>
          <ul className="notification-history-list">
            {notificationHistory.map(({ title, detail, time, icon: Icon }) => (
              <li className="notification-history-item" key={title}>
                <span className="notification-history-icon"><Icon aria-hidden="true" /></span>
                <span className="notification-history-copy"><strong>{title}</strong><small>{detail}</small><time>{time}</time></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}

type PreferenceToggleProps = {
  icon: typeof Mail
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function PreferenceToggle({ icon: Icon, label, description, enabled, onToggle }: PreferenceToggleProps) {
  return (
    <div className="notification-toggle-row">
      <span className="notification-toggle-icon"><Icon aria-hidden="true" /></span>
      <span className="notification-toggle-copy"><strong>{label}</strong><small>{description}</small></span>
      <button type="button" className={`notification-switch ${enabled ? 'enabled' : ''}`} role="switch" aria-checked={enabled} aria-label={label} onClick={onToggle}><span /></button>
    </div>
  )
}
