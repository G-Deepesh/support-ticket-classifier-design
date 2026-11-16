export const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] as const

export const BLOOD_COMPONENTS = [
  'Whole blood',
  'Red blood cells',
  'Platelets',
  'Plasma',
  'Cryoprecipitate',
] as const

export const REQUEST_PRIORITIES = ['Routine', 'Urgent', 'Emergency'] as const

function includesOption<const T extends readonly string[]>(options: T, value: string): value is T[number] {
  return (options as readonly string[]).includes(value)
}

export const isBloodGroup = (value: string) => includesOption(BLOOD_GROUPS, value)
export const isBloodComponent = (value: string) => includesOption(BLOOD_COMPONENTS, value)
export const isRequestPriority = (value: string) => includesOption(REQUEST_PRIORITIES, value)
