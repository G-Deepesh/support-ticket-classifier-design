'use server'

import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { hospitalAlertPreferences, hospitalBloodRequests } from '@/lib/db/schema'

const HOSPITAL_WORKSPACE_USER_ID = 'hospital-workspace'
const alertTypes = ['nearby_donors', 'nearby_blood_banks'] as const
export type HospitalAlertType = (typeof alertTypes)[number]

export async function getHospitalMatchingDashboardData() {
  const [preferenceRows, requests] = await Promise.all([
    db
      .select({ alertType: hospitalAlertPreferences.alertType, enabled: hospitalAlertPreferences.enabled })
      .from(hospitalAlertPreferences)
      .where(eq(hospitalAlertPreferences.userId, HOSPITAL_WORKSPACE_USER_ID)),
    db
      .select({
        id: hospitalBloodRequests.id,
        bloodGroup: hospitalBloodRequests.bloodGroup,
        bloodComponent: hospitalBloodRequests.bloodComponent,
        requiredUnits: hospitalBloodRequests.requiredUnits,
        requiredAt: hospitalBloodRequests.requiredAt,
        priority: hospitalBloodRequests.priority,
        status: hospitalBloodRequests.status,
        createdAt: hospitalBloodRequests.createdAt,
      })
      .from(hospitalBloodRequests)
      .where(eq(hospitalBloodRequests.userId, HOSPITAL_WORKSPACE_USER_ID))
      .orderBy(desc(hospitalBloodRequests.createdAt))
      .limit(100),
  ])

  const preferenceMap = new Map(preferenceRows.map(({ alertType, enabled }) => [alertType, enabled]))

  return {
    preferences: {
      nearby_donors: preferenceMap.get('nearby_donors') ?? false,
      nearby_blood_banks: preferenceMap.get('nearby_blood_banks') ?? false,
    },
    requests: requests.map((request) => ({
      ...request,
      requiredAt: request.requiredAt.toISOString(),
      createdAt: request.createdAt.toISOString(),
    })),
  }
}

export async function updateHospitalAlertPreference(alertType: string, enabled: boolean) {
  if (!alertTypes.includes(alertType as HospitalAlertType) || typeof enabled !== 'boolean') {
    return { ok: false as const, message: 'Choose a valid notification preference.' }
  }

  try {
    await db
      .insert(hospitalAlertPreferences)
      .values({
        userId: HOSPITAL_WORKSPACE_USER_ID,
        alertType: alertType as HospitalAlertType,
        enabled,
      })
      .onConflictDoUpdate({
        target: [hospitalAlertPreferences.userId, hospitalAlertPreferences.alertType],
        set: { enabled, updatedAt: new Date() },
      })

    return { ok: true as const }
  } catch {
    return { ok: false as const, message: 'We could not save this notification preference. Please try again.' }
  }
}
