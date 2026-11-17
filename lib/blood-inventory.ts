export const inventory = [
  { group: 'O−', units: 42, reserve: 120, status: 'Critical', tone: 'critical' },
  { group: 'O+', units: 384, reserve: 240, status: 'In range', tone: 'healthy' },
  { group: 'A−', units: 94, reserve: 90, status: 'In range', tone: 'healthy' },
  { group: 'A+', units: 312, reserve: 190, status: 'In range', tone: 'healthy' },
  { group: 'B−', units: 90, reserve: 80, status: 'In range', tone: 'healthy' },
  { group: 'B+', units: 248, reserve: 130, status: 'In range', tone: 'healthy' },
  { group: 'AB−', units: 24, reserve: 60, status: 'Critical', tone: 'critical' },
  { group: 'AB+', units: 90, reserve: 80, status: 'In range', tone: 'healthy' },
] as const
