'use server'

import { db } from '@/lib/db'
import { hospitalBloodRequests } from '@/lib/db/schema'
import {
  isBloodComponent,
  isBloodGroup,
  isRequestPriority,
} from '@/lib/hospital-blood-request-options'

const HOSPITAL_WORKSPACE_USER_ID = 'hospital-workspace'

type SavedHospitalBloodRequest = {
  id: string
  bloodGroup: string
  bloodComponent: string
  requiredUnits: number
  requiredAt: string
  priority: string
  status: string
  createdAt: string
}

type ActionResult =
  | { ok: true; request: SavedHospitalBloodRequest }
  | { ok: false; message: string }

function getText(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createHospitalBloodRequest(formData: FormData): Promise<ActionResult> {
  const bloodGroup = getText(formData, 'bloodGroup')
  const bloodComponent = getText(formData, 'bloodComponent')
  const requiredUnitsValue = getText(formData, 'requiredUnits')
  const requiredAtValue = getText(formData, 'requiredAt')
  const priority = getText(formData, 'priority')

  if (!isBloodGroup(bloodGroup)) {
    return { ok: false, message: 'Choose a valid blood group.' }
  }

  if (!isBloodComponent(bloodComponent)) {
    return { ok: false, message: 'Choose a valid blood component.' }
  }

  if (!/^\d+$/.test(requiredUnitsValue)) {
    return { ok: false, message: 'Enter a whole number of units between 1 and 10,000.' }
  }

  const requiredUnits = Number(requiredUnitsValue)
  if (!Number.isSafeInteger(requiredUnits) || requiredUnits < 1 || requiredUnits > 10000) {
    return { ok: false, message: 'Enter a whole number of units between 1 and 10,000.' }
  }

  const requiredAt = new Date(requiredAtValue)
  if (!requiredAtValue || Number.isNaN(requiredAt.getTime()) || requiredAt.getTime() <= Date.now()) {
    return { ok: false, message: 'Choose a required date and time in the future.' }
  }

  if (!isRequestPriority(priority)) {
    return { ok: false, message: 'Choose a valid priority level.' }
  }

  try {
    const [createdRequest] = await db
      .insert(hospitalBloodRequests)
      .values({
        userId: HOSPITAL_WORKSPACE_USER_ID,
        bloodGroup,
        bloodComponent,
        requiredUnits,
        requiredAt,
        priority,
      })
      .returning({
        id: hospitalBloodRequests.id,
        bloodGroup: hospitalBloodRequests.bloodGroup,
        bloodComponent: hospitalBloodRequests.bloodComponent,
        requiredUnits: hospitalBloodRequests.requiredUnits,
        requiredAt: hospitalBloodRequests.requiredAt,
        priority: hospitalBloodRequests.priority,
        status: hospitalBloodRequests.status,
        createdAt: hospitalBloodRequests.createdAt,
      })

    if (!createdRequest) {
      return { ok: false, message: 'We could not confirm the saved request. Please try again.' }
    }

    return {
      ok: true,
      request: {
        ...createdRequest,
        requiredAt: createdRequest.requiredAt.toISOString(),
        createdAt: createdRequest.createdAt.toISOString(),
      },
    }
  } catch {
    return { ok: false, message: 'We could not save your request. Please try again in a moment.' }
  }
}
