import { sql } from 'drizzle-orm'
import { boolean, check, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

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

export const hospitalDeliveryTracking = pgTable(
  'hospital_delivery_tracking',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().default('hospital-workspace'),
    requestId: uuid('request_id').notNull(),
    deliveryStatus: text('delivery_status').notNull().default('Pending'),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'hospital_delivery_tracking_status_check',
      sql`${table.deliveryStatus} in ('Pending', 'Approved', 'Allocated', 'Dispatched', 'Received', 'Completed', 'Cancelled')`,
    ),
    unique('hospital_delivery_tracking_user_request_unique').on(table.userId, table.requestId),
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
