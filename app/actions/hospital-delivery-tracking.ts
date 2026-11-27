'use server'

import { and, count, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { donorRequestResponses, hospitalBloodRequests, hospitalDeliveryTracking } from '@/lib/db/schema'
import { DELIVERY_STATUSES, type DeliveryStatus } from '@/lib/hospital-delivery-statuses'

const HOSPITAL_WORKSPACE_USER_ID = 'hospital-workspace'
const DELIVERY_STATUS_SET = new Set<string>(DELIVERY_STATUSES)

export async function getHospitalDeliveryRequests() {
  const responseCounts = await db
    .select({ requestId: donorRequestResponses.requestId, total: count() })
    .from(donorRequestResponses)
    .groupBy(donorRequestResponses.requestId)
  const responseCountByRequest = new Map(responseCounts.map((row) => [row.requestId, Number(row.total)]))

  const rows = await db
    .select({
      id: hospitalBloodRequests.id,
      bloodGroup: hospitalBloodRequests.bloodGroup,
      bloodComponent: hospitalBloodRequests.bloodComponent,
      requiredUnits: hospitalBloodRequests.requiredUnits,
      requiredAt: hospitalBloodRequests.requiredAt,
      priority: hospitalBloodRequests.priority,
      requestStatus: hospitalBloodRequests.status,
      createdAt: hospitalBloodRequests.createdAt,
      deliveryStatus: hospitalDeliveryTracking.deliveryStatus,
      deliveryUpdatedAt: hospitalDeliveryTracking.updatedAt,
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
    .orderBy(desc(hospitalBloodRequests.createdAt))

  return rows.map((request) => ({
    ...request,
    deliveryStatus: (request.deliveryStatus ?? 'Pending') as DeliveryStatus,
    requiredAt: request.requiredAt.toISOString(),
    createdAt: request.createdAt.toISOString(),
    deliveryUpdatedAt: request.deliveryUpdatedAt?.toISOString() ?? null,
    donorResponses: responseCountByRequest.get(request.id) ?? 0,
  }))
}

export async function updateHospitalDeliveryStatus(requestId: string, status: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return { ok: false as const, message: 'Choose a valid request.' }
  }

  if (!DELIVERY_STATUS_SET.has(status)) {
    return { ok: false as const, message: 'Choose a valid delivery status.' }
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
      .insert(hospitalDeliveryTracking)
      .values({
        userId: HOSPITAL_WORKSPACE_USER_ID,
        requestId,
        deliveryStatus: status as DeliveryStatus,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [hospitalDeliveryTracking.userId, hospitalDeliveryTracking.requestId],
        set: {
          deliveryStatus: status as DeliveryStatus,
          updatedAt: new Date(),
        },
      })

    revalidatePath('/')
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: 'We could not update this delivery status. Please try again.' }
  }
}
