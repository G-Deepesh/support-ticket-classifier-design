import { sql } from 'drizzle-orm'
import { boolean, check, doublePrecision, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

export const hospitalAlertPreferences = pgTable(
  'hospital_alert_preferences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().default('hospital-workspace'),
    alertType: text('alert_type').notNull(),
    enabled: boolean('enabled').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'hospital_alert_preferences_alert_type_check',
      sql`${table.alertType} in ('nearby_donors', 'nearby_blood_banks')`,
    ),
    unique('hospital_alert_preferences_user_alert_unique').on(table.userId, table.alertType),
  ],
)

export const bloodBanks = pgTable(
  'blood_banks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().default('hospital-workspace'),
    name: text('name').notNull(),
    address: text('address').notNull(),
    city: text('city').notNull(),
    region: text('region').notNull().default(''),
    postalCode: text('postal_code').notNull().default(''),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    unique('blood_banks_user_name_address_unique').on(table.userId, table.name, table.address),
    check('blood_banks_coordinates_pair_check', sql`(${table.latitude} is null) = (${table.longitude} is null)`),
    check('blood_banks_latitude_check', sql`${table.latitude} is null or ${table.latitude} between -90 and 90`),
    check('blood_banks_longitude_check', sql`${table.longitude} is null or ${table.longitude} between -180 and 180`),
  ],
)

export const bloodBankInventory = pgTable(
  'blood_bank_inventory',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().default('hospital-workspace'),
    bloodBankId: uuid('blood_bank_id').notNull(),
    bloodGroup: text('blood_group').notNull(),
    bloodComponent: text('blood_component').notNull(),
    availableUnits: integer('available_units').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check('blood_bank_inventory_blood_group_check', sql`${table.bloodGroup} in ('A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−')`),
    check('blood_bank_inventory_blood_component_check', sql`${table.bloodComponent} in ('Whole blood', 'Red blood cells', 'Platelets', 'Plasma', 'Cryoprecipitate')`),
    check('blood_bank_inventory_available_units_check', sql`${table.availableUnits} between 0 and 1000000`),
    check('blood_bank_inventory_low_stock_threshold_check', sql`${table.lowStockThreshold} between 0 and 100000`),
    unique('blood_bank_inventory_unique').on(table.userId, table.bloodBankId, table.bloodGroup, table.bloodComponent),
  ],
)

export const hospitalBloodRequests = pgTable(
  'hospital_blood_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().default('hospital-workspace'),
    bloodGroup: text('blood_group').notNull(),
    bloodComponent: text('blood_component').notNull(),
    requiredUnits: integer('required_units').notNull(),
    requiredAt: timestamp('required_at', { withTimezone: true, mode: 'date' }).notNull(),
    priority: text('priority').notNull(),
    status: text('status').notNull().default('Submitted'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'hospital_blood_requests_blood_group_check',
      sql`${table.bloodGroup} in ('A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−')`,
    ),
    check(
      'hospital_blood_requests_blood_component_check',
      sql`${table.bloodComponent} in ('Whole blood', 'Red blood cells', 'Platelets', 'Plasma', 'Cryoprecipitate')`,
    ),
    check(
      'hospital_blood_requests_required_units_check',
      sql`${table.requiredUnits} between 1 and 10000`,
    ),
    check(
      'hospital_blood_requests_priority_check',
      sql`${table.priority} in ('Routine', 'Urgent', 'Emergency')`,
    ),
  ],
)
