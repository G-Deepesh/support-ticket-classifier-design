'use server'

import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { donorRequestResponses, hospitalBloodRequests, hospitalDeliveryTracking } from '@/lib/db/schema'

const HOSPITAL_WORKSPACE_USER_ID = 'hospital-workspace'
const DONOR_WORKSPACE_ID = 'donor-workspace'
const CLOSED_DELIVERY_STATUSES = ['Received', 'Completed', 'Cancelled']

export async function getOpenRequestsForDonors() {
  const [rows, responses] = await Promise.all([
    db
      .select({
        id: hospitalBloodRequests.id,
        bloodGroup: hospitalBloodRequests.bloodGroup,
        bloodComponent: hospitalBloodRequests.bloodComponent,
        requiredUnits: hospitalBloodRequests.requiredUnits,
        requiredAt: hospitalBloodRequests.requiredAt,
        priority: hospitalBloodRequests.priority,
        createdAt: hospitalBloodRequests.createdAt,
        deliveryStatus: hospitalDeliveryTracking.deliveryStatus,
      })
      .from(hospitalBloodRequests)
      .leftJoin(
        hospitalDeliveryTracking,
        and(
          eq(hospitalDeliveryTracking.requestId, hospitalBloodRequests.id),
          eq(hospitalDeliveryTracking.userId, HOSPITAL_WORKSPACE_USER_ID),
        ),
      )
      .where(eq(hospitalBloodRequests.userId, HOSPITAL_WORKSPACE_USER_ID))
      .orderBy(desc(hospitalBloodRequests.createdAt)),
    db
      .select({ requestId: donorRequestResponses.requestId })
      .from(donorRequestResponses)
      .where(eq(donorRequestResponses.donorId, DONOR_WORKSPACE_ID)),
  ])

  const respondedIds = new Set(responses.map((response) => response.requestId))

  return rows
    .filter((row) => !CLOSED_DELIVERY_STATUSES.includes(row.deliveryStatus ?? 'Pending'))
    .map((row) => ({
      id: row.id,
      bloodGroup: row.bloodGroup,
      bloodComponent: row.bloodComponent,
      requiredUnits: row.requiredUnits,
      priority: row.priority,
      requiredAt: row.requiredAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      hasResponded: respondedIds.has(row.id),
    }))
}

export async function respondToHospitalRequest(requestId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return { ok: false as const, message: 'Choose a valid request.' }
  }

  const [request] = await db
    .select({ id: hospitalBloodRequests.id })
    .from(hospitalBloodRequests)
    .where(
      and(
        eq(hospitalBloodRequests.id, requestId),
        eq(hospitalBloodRequests.userId, HOSPITAL_WORKSPACE_USER_ID),
      ),
    )
    .limit(1)

  if (!request) {
    return { ok: false as const, message: 'That request could not be found.' }
  }

  try {
    await db
      .insert(donorRequestResponses)
      .values({ donorId: DONOR_WORKSPACE_ID, requestId })
      .onConflictDoNothing({ target: [donorRequestResponses.donorId, donorRequestResponses.requestId] })

    revalidatePath('/')
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: 'We could not record your response. Please try again.' }
  }
}

export async function withdrawHospitalRequestResponse(requestId: string) {
  try {
    await db
      .delete(donorRequestResponses)
      .where(
        and(
          eq(donorRequestResponses.requestId, requestId),
          eq(donorRequestResponses.donorId, DONOR_WORKSPACE_ID),
        ),
      )
    revalidatePath('/')
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: 'We could not update your response. Please try again.' }
  }
}
