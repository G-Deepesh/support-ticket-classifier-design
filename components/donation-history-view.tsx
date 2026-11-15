'use client'

import { CalendarDays, CheckCircle2, Clock3, Download, FileText, HeartPulse, MapPin, UserRound } from 'lucide-react'

type DonationRecord = {
  id: string
  date: string
  center: string
  donationType: string
}

const donationRecords: DonationRecord[] = [
  { id: '0142', date: 'January 12, 2026', center: 'City Blood Center', donationType: 'Whole blood' },
  { id: '0118', date: 'September 14, 2025', center: 'Community Donation Center', donationType: 'Whole blood' },
  { id: '0097', date: 'May 18, 2025', center: 'City Blood Center', donationType: 'Plasma' },
]

const summaryMetrics = [
  { label: 'Total donations', value: '4', note: 'Lifetime recorded donations', icon: HeartPulse, tone: 'red' },
  { label: 'Completed donations', value: '4', note: 'Confirmed as completed', icon: CheckCircle2, tone: 'green' },
  { label: 'Upcoming donation appointments', value: '1', note: 'Next appointment: Dec 4, 2026', icon: CalendarDays, tone: 'blue' },
]

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function downloadCertificate(record: DonationRecord, donorName: string) {
  const certificate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sample donation certificate</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 36px; color: #183043; background: #f2f6f4; font: 16px/1.5 Arial, sans-serif; }
    main { max-width: 760px; margin: 24px auto; padding: 56px; border: 2px solid #347d68; background: #fff; text-align: center; }
    .sample { display: inline-block; padding: 6px 12px; border: 1px solid #a9414b; color: #a9414b; font-size: 12px; font-weight: 700; letter-spacing: .12em; }
    h1 { margin: 28px 0 8px; font-family: Georgia, serif; font-size: 36px; }
    .name { margin: 24px 0; font-family: Georgia, serif; font-size: 28px; }
    .details { margin: 28px auto; text-align: left; }
    .details p { padding: 10px 0; border-bottom: 1px solid #e6ece8; }
    .notice { margin-top: 34px; color: #a9414b; font-size: 13px; font-weight: 700; }
    @media print { body { padding: 0; background: #fff; } main { margin: 0 auto; } }
  </style>
</head>
<body>
  <main>
    <span class="sample">SAMPLE · NOT AN OFFICIAL CERTIFICATE</span>
    <h1>Donation Certificate</h1>
    <p>This sample document records an illustrative donation entry.</p>
    <p class="name">${escapeHtml(donorName || 'Sample donor')}</p>
    <div class="details">
      <p><strong>Donation date:</strong> ${escapeHtml(record.date)}</p>
      <p><strong>Donation type:</strong> ${escapeHtml(record.donationType)}</p>
      <p><strong>Donation center:</strong> ${escapeHtml(record.center)}</p>
      <p><strong>Record reference:</strong> SAMPLE-${escapeHtml(record.id)}</p>
    </div>
    <p class="notice">SAMPLE ONLY — this is not a medical record or proof of donation.</p>
  </main>
</body>
</html>`
  const file = new Blob([certificate], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `sample-donation-certificate-${record.id}.html`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function DonationHistoryView({ profileName }: { profileName: string }) {
  return (
    <section className="pulse-overview donation-history-view" aria-labelledby="donation-history-title">
      <header className="pulse-overview-heading">
        <div>
          <p className="pulse-kicker"><span className="pulse-kicker-dot" /> DONOR SERVICES · HISTORY</p>
          <h1 id="donation-history-title">Donation history</h1>
          <p className="pulse-intro">Review your donation milestones, upcoming appointments, and records.</p>
        </div>
        <span className="pulse-ai-chip"><UserRound aria-hidden="true" /> {profileName}</span>
      </header>

      <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Illustrative donation records and appointments. Confirm official details with your donation center.</div>

      <section className="pulse-metric-grid donation-history-metrics" aria-label="Donation summary">
        {summaryMetrics.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="pulse-metric-card" key={label}>
            <div className="pulse-metric-top"><span>{label}</span><span className={`pulse-metric-icon ${tone}`}><Icon aria-hidden="true" /></span></div>
            <strong className="pulse-metric-value">{value}</strong>
            <div className="pulse-metric-foot"><span>{note}</span></div>
          </article>
        ))}
      </section>

      <section className="pulse-panel donation-appointment-panel" aria-labelledby="upcoming-donation-title">
        <div className="pulse-section-heading">
          <div><p className="pulse-kicker">UPCOMING</p><h2 id="upcoming-donation-title">Upcoming donation appointment</h2><p>Your next scheduled visit.</p></div>
          <span className="pulse-inventory-updated"><span className="pulse-status-dot" /> Scheduled</span>
        </div>
        <div className="donation-appointment-card">
          <div className="donation-appointment-date"><span>DEC</span><strong>04</strong><small>2026</small></div>
          <div className="donation-appointment-details"><strong>Whole blood donation</strong><span><Clock3 aria-hidden="true" /> 10:30 AM</span><span><MapPin aria-hidden="true" /> City Blood Center · Downtown</span></div>
          <span className="donation-appointment-status"><CalendarDays aria-hidden="true" /> Appointment</span>
        </div>
      </section>

      <section className="pulse-panel donation-record-panel" aria-labelledby="donation-record-title">
        <div className="pulse-section-heading">
          <div><p className="pulse-kicker">COMPLETED VISITS</p><h2 id="donation-record-title">Donation record</h2><p>Recent completed donations and their certificate previews.</p></div>
        </div>
        <div className="donation-record-list">
          {donationRecords.map((record) => (
            <article className="donation-record-row" key={record.id}>
              <div className="donation-record-main"><span className="donation-record-icon"><FileText aria-hidden="true" /></span><span className="donation-record-copy"><strong>{record.date}</strong><small>{record.donationType} · {record.center}</small></span></div>
              <span className="donation-record-status">Completed</span>
              <button className="pulse-secondary-link donation-download-button" type="button" onClick={() => downloadCertificate(record, profileName)} aria-label={`Download sample certificate for ${record.date}`}><Download aria-hidden="true" /> Download certificate</button>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
