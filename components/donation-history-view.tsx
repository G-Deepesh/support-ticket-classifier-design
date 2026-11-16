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
    body { margin: 0; padding: 32px; color: #183b33; background: #edf2ee; font: 15px/1.55 Arial, Helvetica, sans-serif; }
    main { position: relative; width: min(100%, 850px); min-height: 650px; margin: 18px auto; padding: 48px 56px; overflow: hidden; border: 1px solid #c7d5ca; background: #fffdf7; box-shadow: 0 24px 70px rgba(31, 58, 48, .12); }
    main::before { position: absolute; inset: 11px; border: 1px solid rgba(104, 129, 100, .24); content: ''; pointer-events: none; }
    .certificate-heading, .brand-lockup, .brand-name { display: flex; }
    .certificate-heading { align-items: center; justify-content: space-between; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid #dce5dd; }
    .brand-lockup { align-items: center; gap: 11px; }
    .brand-mark { display: grid; width: 40px; height: 40px; place-items: center; border: 1px solid #345a4c; border-radius: 12px; background: #1b473a; color: #f8f2e4; font: 700 13px Georgia, serif; letter-spacing: .04em; }
    .brand-name { flex-direction: column; gap: 2px; color: #183b33; font-size: 13px; font-weight: 700; letter-spacing: -.02em; }
    .brand-name small, .certificate-kind { color: #8a7953; font-size: 8px; font-weight: 700; letter-spacing: .16em; }
    .certificate-kind { white-space: nowrap; }
    .certificate-body { max-width: 660px; margin: 38px auto 0; text-align: center; }
    .preview-label { display: inline-flex; padding: 6px 11px; border: 1px solid #e5d9b8; border-radius: 999px; background: #f8f2e4; color: #76633b; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 17px 0 7px; color: #173d32; font: 400 clamp(34px, 6vw, 50px)/1.08 Georgia, 'Times New Roman', serif; letter-spacing: -.035em; }
    .lead { margin: 0; color: #728178; font-size: 12px; }
    .recipient { margin: 30px auto 26px; }
    .recipient-label { color: #8a7953; font-size: 8px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
    .name { margin: 7px 0 5px; color: #244d3e; font: 400 clamp(25px, 5vw, 35px)/1.2 Georgia, 'Times New Roman', serif; }
    .message { margin: 0; color: #7a8880; font-size: 11px; }
    .details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 0 auto; text-align: left; }
    .detail-card { min-width: 0; padding: 13px 14px; border: 1px solid #e1e8e0; border-radius: 12px; background: #f8faf6; }
    .detail-label { display: block; margin-bottom: 5px; color: #8a938c; font-size: 8px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .detail-value { display: block; color: #27483b; font-size: 11px; font-weight: 700; overflow-wrap: anywhere; }
    .record-reference { margin: 15px 0 0; color: #818c83; font-size: 9px; }
    .record-reference strong { color: #536e5e; font-weight: 700; letter-spacing: .04em; }
    .notice { margin: 27px auto 0; padding: 12px 15px; border: 1px solid #eadfc4; border-radius: 10px; background: #fbf6e9; color: #715c34; font-size: 10px; line-height: 1.5; }
    .notice strong { display: block; margin-bottom: 2px; color: #69552e; font-size: 9px; letter-spacing: .06em; text-transform: uppercase; }
    .certificate-footer { display: flex; justify-content: space-between; gap: 12px; margin-top: 34px; padding-top: 12px; border-top: 1px solid #e4e9e2; color: #929b93; font-size: 8px; letter-spacing: .04em; }
    @media (max-width: 600px) { body { padding: 12px; } main { min-height: 0; padding: 34px 24px; } .certificate-heading { align-items: flex-start; } .certificate-kind { max-width: 100px; text-align: right; } .certificate-body { margin-top: 28px; } .details { grid-template-columns: 1fr; } .detail-card { padding: 11px 12px; } .certificate-footer { flex-direction: column; gap: 4px; } }
    @media print { body { padding: 0; background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; } main { width: 100%; min-height: 0; margin: 0; box-shadow: none; break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header class="certificate-heading">
      <div class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">PS</span>
        <span class="brand-name">Pulse Share<small>DONOR SERVICES</small></span>
      </div>
      <span class="certificate-kind">DONOR RECOGNITION</span>
    </header>
    <section class="certificate-body" aria-labelledby="certificate-title">
      <span class="preview-label">Certificate preview · Sample data</span>
      <h1 id="certificate-title">Donation Certificate</h1>
      <p class="lead">Preview of an illustrative donation record</p>
      <div class="recipient">
        <span class="recipient-label">Prepared for</span>
        <p class="name">${escapeHtml(donorName || 'Sample donor')}</p>
        <p class="message">Thank you for being part of a caring community.</p>
      </div>
      <div class="details">
        <div class="detail-card"><span class="detail-label">Donation date</span><strong class="detail-value">${escapeHtml(record.date)}</strong></div>
        <div class="detail-card"><span class="detail-label">Donation type</span><strong class="detail-value">${escapeHtml(record.donationType)}</strong></div>
        <div class="detail-card"><span class="detail-label">Collection center</span><strong class="detail-value">${escapeHtml(record.center)}</strong></div>
      </div>
      <p class="record-reference">Record reference <strong>SAMPLE-${escapeHtml(record.id)}</strong></p>
      <div class="notice" role="note"><strong>Illustrative preview</strong><span>Official donation records are issued by your donation center. This document is not an official certificate or proof of donation.</span></div>
    </section>
    <footer class="certificate-footer"><span>Pulse Share · Donor services</span><span>Illustrative record only</span></footer>
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
        <div className="pulse-demo-note" role="note"><span className="pulse-demo-badge">Sample data</span> Verify records with your donation center.</div>
      </section>
    </section>
  )
}
