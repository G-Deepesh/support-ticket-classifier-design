'use server'

import { and, asc, eq, ilike, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bloodBankInventory, bloodBanks } from '@/lib/db/schema'

const WORKSPACE_USER_ID = 'hospital-workspace'
const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] as const
const BLOOD_COMPONENTS = ['Whole blood', 'Red blood cells', 'Platelets', 'Plasma', 'Cryoprecipitate'] as const

export async function getBloodAvailability(filters: {
  bloodGroup?: string
  bloodComponent?: string
  location?: string
}) {
  const safeFilters = filters && typeof filters === 'object' ? filters : {}
  const conditions = [
    eq(bloodBankInventory.userId, WORKSPACE_USER_ID),
    eq(bloodBanks.userId, WORKSPACE_USER_ID),
  ]

  if (safeFilters.bloodGroup && BLOOD_GROUPS.includes(safeFilters.bloodGroup as (typeof BLOOD_GROUPS)[number])) {
    conditions.push(eq(bloodBankInventory.bloodGroup, safeFilters.bloodGroup))
  }

  if (safeFilters.bloodComponent && BLOOD_COMPONENTS.includes(safeFilters.bloodComponent as (typeof BLOOD_COMPONENTS)[number])) {
    conditions.push(eq(bloodBankInventory.bloodComponent, safeFilters.bloodComponent))
  }

  const location = typeof safeFilters.location === 'string' ? safeFilters.location.trim().slice(0, 100) : ''
  if (location) {
    const escapedLocation = location.replace(/[\\%_]/g, '\\$&')
    const searchPattern = `%${escapedLocation}%`
    const locationCondition = or(
      ilike(bloodBanks.name, searchPattern),
      ilike(bloodBanks.address, searchPattern),
      ilike(bloodBanks.city, searchPattern),
      ilike(bloodBanks.region, searchPattern),
      ilike(bloodBanks.postalCode, searchPattern),
    )
    if (locationCondition) conditions.push(locationCondition)
  }

  const records = await db
    .select({
      id: bloodBankInventory.id,
      bloodBankId: bloodBanks.id,
      bankName: bloodBanks.name,
      address: bloodBanks.address,
      city: bloodBanks.city,
      region: bloodBanks.region,
      postalCode: bloodBanks.postalCode,
      latitude: bloodBanks.latitude,
      longitude: bloodBanks.longitude,
      bloodGroup: bloodBankInventory.bloodGroup,
      bloodComponent: bloodBankInventory.bloodComponent,
      availableUnits: bloodBankInventory.availableUnits,
      lowStockThreshold: bloodBankInventory.lowStockThreshold,
      updatedAt: bloodBankInventory.updatedAt,
    })
    .from(bloodBankInventory)
    .innerJoin(
      bloodBanks,
      and(
        eq(bloodBankInventory.bloodBankId, bloodBanks.id),
        eq(bloodBankInventory.userId, bloodBanks.userId),
      ),
    )
    .where(and(...conditions))
    .orderBy(asc(bloodBanks.city), asc(bloodBanks.name), asc(bloodBankInventory.bloodGroup))
    .limit(500)

  return records.map((record) => ({ ...record, updatedAt: record.updatedAt.toISOString() }))
}

export async function saveBloodBankInventory(input: {
  bankName: string
  address: string
  city: string
  region: string
  postalCode: string
  latitude: number | null
  longitude: number | null
  bloodGroup: string
  bloodComponent: string
  availableUnits: number
  lowStockThreshold: number
}) {
  if (!input || typeof input !== 'object') {
    return { ok: false as const, message: 'Enter a valid stock report.' }
  }

  const bankName = typeof input.bankName === 'string' ? input.bankName.trim() : ''
  const address = typeof input.address === 'string' ? input.address.trim() : ''
  const city = typeof input.city === 'string' ? input.city.trim() : ''
  const region = typeof input.region === 'string' ? input.region.trim() : ''
  const postalCode = typeof input.postalCode === 'string' ? input.postalCode.trim() : ''
  const latitude = input.latitude
  const longitude = input.longitude

  if (!bankName || bankName.length > 120 || !address || address.length > 240 || !city || city.length > 100) {
    return { ok: false as const, message: 'Enter a blood-bank name, street address, and city.' }
  }
  if (region.length > 100 || postalCode.length > 20) {
    return { ok: false as const, message: 'Region or postal code is too long.' }
  }
  if (!BLOOD_GROUPS.includes(input.bloodGroup as (typeof BLOOD_GROUPS)[number])) {
    return { ok: false as const, message: 'Select a valid blood group.' }
  }
  if (!BLOOD_COMPONENTS.includes(input.bloodComponent as (typeof BLOOD_COMPONENTS)[number])) {
    return { ok: false as const, message: 'Select a valid blood component.' }
  }
  if (!Number.isInteger(input.availableUnits) || input.availableUnits < 0 || input.availableUnits > 1_000_000) {
    return { ok: false as const, message: 'Available units must be a whole number from 0 to 1,000,000.' }
  }
  if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0 || input.lowStockThreshold > 100_000) {
    return { ok: false as const, message: 'The low-stock threshold must be a whole number from 0 to 100,000.' }
  }
  if ((latitude === null) !== (longitude === null)) {
    return { ok: false as const, message: 'Enter both coordinates or leave both blank.' }
  }
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    return { ok: false as const, message: 'Latitude must be between −90 and 90.' }
  }
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    return { ok: false as const, message: 'Longitude must be between −180 and 180.' }
  }

  try {
    await db.transaction(async (transaction) => {
      const [bank] = await transaction
        .insert(bloodBanks)
        .values({
          userId: WORKSPACE_USER_ID,
          name: bankName,
          address,
          city,
          region,
          postalCode,
          latitude,
          longitude,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [bloodBanks.userId, bloodBanks.name, bloodBanks.address],
          set: { city, region, postalCode, latitude, longitude, updatedAt: new Date() },
        })
        .returning({ id: bloodBanks.id })

      if (!bank) throw new Error('Blood bank could not be saved.')

      await transaction
        .insert(bloodBankInventory)
        .values({
          userId: WORKSPACE_USER_ID,
          bloodBankId: bank.id,
          bloodGroup: input.bloodGroup,
          bloodComponent: input.bloodComponent,
          availableUnits: input.availableUnits,
          lowStockThreshold: input.lowStockThreshold,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            bloodBankInventory.userId,
            bloodBankInventory.bloodBankId,
            bloodBankInventory.bloodGroup,
            bloodBankInventory.bloodComponent,
          ],
          set: {
            availableUnits: input.availableUnits,
            lowStockThreshold: input.lowStockThreshold,
            updatedAt: new Date(),
          },
        })
    })

    return { ok: true as const }
  } catch {
    return { ok: false as const, message: 'Inventory could not be saved. Please try again.' }
  }
}
