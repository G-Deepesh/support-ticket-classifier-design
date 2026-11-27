'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type Profile = 'donor' | 'hospital' | 'bloodBank'

const donorTrend = [
  { period: 'Q4 ’25', donations: 1 },
  { period: 'Q1 ’26', donations: 2 },
  { period: 'Q2 ’26', donations: 3 },
  { period: 'Q3 ’26', donations: 4 },
]

const donorTrendConfig = {
  donations: { label: 'Donations', color: 'var(--chart-1)' },
} satisfies ChartConfig

const donorMilestoneConfig = {
  complete: { label: 'Donations made', color: 'var(--chart-1)' },
  remaining: { label: 'Next milestone', color: 'var(--chart-2)' },
} satisfies ChartConfig

const donorMilestone = [
  { name: 'complete', value: 4, fill: 'var(--color-complete)' },
  { name: 'remaining', value: 1, fill: 'var(--color-remaining)' },
]

const hospitalRequestTrend = [
  { day: 'Mon', open: 8, fulfilled: 5 },
  { day: 'Tue', open: 10, fulfilled: 7 },
  { day: 'Wed', open: 7, fulfilled: 6 },
  { day: 'Thu', open: 12, fulfilled: 8 },
  { day: 'Fri', open: 9, fulfilled: 7 },
  { day: 'Sat', open: 6, fulfilled: 4 },
  { day: 'Sun', open: 8, fulfilled: 5 },
]

const hospitalRequestConfig = {
  open: { label: 'Open requests', color: 'var(--chart-1)' },
  fulfilled: { label: 'Fulfilled', color: 'var(--chart-2)' },
} satisfies ChartConfig

const hospitalUrgency = [
  { name: 'critical', value: 3, fill: 'var(--color-critical)' },
  { name: 'urgent', value: 5, fill: 'var(--color-urgent)' },
  { name: 'routine', value: 4, fill: 'var(--color-routine)' },
]

const hospitalUrgencyConfig = {
  critical: { label: 'Critical', color: 'var(--chart-1)' },
  urgent: { label: 'Urgent', color: 'var(--chart-2)' },
  routine: { label: 'Routine', color: 'var(--chart-3)' },
} satisfies ChartConfig

const inventory = [
  { group: 'O−', units: 42, reserve: 60 },
  { group: 'A−', units: 86, reserve: 70 },
  { group: 'B+', units: 118, reserve: 80 },
  { group: 'AB−', units: 18, reserve: 30 },
]

const inventoryConfig = {
  units: { label: 'Available units', color: 'var(--chart-1)' },
  reserve: { label: 'Reserve target', color: 'var(--chart-2)' },
} satisfies ChartConfig

const demandForecast = [
  { day: 'Mon', units: 112 },
  { day: 'Tue', units: 128 },
  { day: 'Wed', units: 121 },
  { day: 'Thu', units: 146 },
  { day: 'Fri', units: 173 },
  { day: 'Sat', units: 151 },
  { day: 'Sun', units: 139 },
]

const demandConfig = {
  units: { label: 'Projected demand', color: 'var(--chart-1)' },
} satisfies ChartConfig

const chartColors = ['var(--color-critical)', 'var(--color-urgent)', 'var(--color-routine)']

function ChartPanel({
  eyebrow,
  title,
  summary,
  config,
  className = '',
  children,
}: {
  eyebrow: string
  title: string
  summary: string
  config: ChartConfig
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`dash-overview-card dash-chart-card ${className}`} aria-label={`${title}. ${summary}`}>
      <div className="dash-section-title">
        <div><p className="dash-card-eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      </div>
      <ChartContainer config={config} className="dash-chart-frame">
        {children}
      </ChartContainer>
      <p className="dash-chart-summary">{summary}</p>
    </section>
  )
}

export default function DashboardOverviewCharts({ profile }: { profile: Profile }) {
  if (profile === 'donor') {
    return (
      <div className="dash-chart-grid donor-chart-grid">
        <ChartPanel eyebrow="DONATION HISTORY · SAMPLE" title="Donation progress by quarter" summary="Illustrative cumulative donations rise to four across the past four quarters." config={donorTrendConfig}>
          <AreaChart data={donorTrend} accessibilityLayer margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="donorTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-donations)" stopOpacity={0.28} /><stop offset="95%" stopColor="var(--color-donations)" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid vertical={false} strokeDasharray="3 5" />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="donations" stroke="var(--color-donations)" strokeWidth={2.5} fill="url(#donorTrendFill)" />
          </AreaChart>
        </ChartPanel>
        <ChartPanel eyebrow="NEXT MILESTONE" title="One donation to go" summary="You’re 4 of 5 donations toward your next milestone. Personal history shown is illustrative." config={donorMilestoneConfig} className="donor-milestone-card">
          <PieChart accessibilityLayer>
            <Pie data={donorMilestone} dataKey="value" nameKey="name" innerRadius="72%" outerRadius="94%" stroke="none">
              {donorMilestone.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
            </Pie>
            <Tooltip content={<ChartTooltipContent nameKey="name" />} />
            <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="dash-radial-value">80%</text>
            <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" className="dash-radial-label">complete</text>
          </PieChart>
        </ChartPanel>
      </div>
    )
  }

  if (profile === 'hospital') {
    return (
      <div className="dash-chart-grid hospital-chart-grid">
        <ChartPanel eyebrow="REQUEST ACTIVITY · SAMPLE" title="Requests through the week" summary="Illustrative open and fulfilled blood requests, Monday through Sunday." config={hospitalRequestConfig}>
          <BarChart data={hospitalRequestTrend} accessibilityLayer margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 5" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="open" fill="var(--color-open)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="fulfilled" fill="var(--color-fulfilled)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartPanel>
        <ChartPanel eyebrow="PRIORITY MIX · SAMPLE" title="Requests by urgency" summary="3 critical · 5 urgent · 4 routine requests in this illustrative snapshot." config={hospitalUrgencyConfig} className="hospital-urgency-card">
          <PieChart accessibilityLayer>
            <Pie data={hospitalUrgency} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={4} stroke="none">
              {hospitalUrgency.map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}
            </Pie>
            <Tooltip content={<ChartTooltipContent nameKey="name" />} />
          </PieChart>
        </ChartPanel>
      </div>
    )
  }

  return (
    <div className="dash-chart-grid bloodbank-chart-grid">
      <ChartPanel eyebrow="STOCK HEALTH · SAMPLE" title="Available units vs reserve" summary="O− and AB− are below their reserve targets in this illustrative inventory snapshot." config={inventoryConfig}>
        <BarChart data={inventory} accessibilityLayer margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="group" axisLine={false} tickLine={false} tickMargin={8} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={38} />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="units" fill="var(--color-units)" radius={[5, 5, 0, 0]} />
          <Bar dataKey="reserve" fill="var(--color-reserve)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ChartPanel>
      <ChartPanel eyebrow="DEMAND PLANNING · SAMPLE" title="7-day demand forecast" summary="Illustrative demand peaks Friday at 173 units. Validate against local collection and hospital data." config={demandConfig}>
        <AreaChart data={demandForecast} accessibilityLayer margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs><linearGradient id="bloodDemandFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-units)" stopOpacity={0.28} /><stop offset="95%" stopColor="var(--color-units)" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid vertical={false} strokeDasharray="3 5" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={38} />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area type="monotone" dataKey="units" stroke="var(--color-units)" strokeWidth={2.5} fill="url(#bloodDemandFill)" />
        </AreaChart>
      </ChartPanel>
    </div>
  )
}
