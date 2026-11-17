export const DELIVERY_STATUSES = [
  'Pending',
  'Approved',
  'Allocated',
  'Dispatched',
  'Received',
  'Completed',
  'Cancelled',
] as const

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]
