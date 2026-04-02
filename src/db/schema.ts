import { pgTable, text, timestamp, doublePrecision, integer, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const attendanceStatusEnum = pgEnum('attendance_status', ['VALID', 'INVALID_LOCATION', 'EXPIRED_QR']);
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'PARTICIPANT']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: userRoleEnum('role').default('PARTICIPANT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  radius: integer('radius').default(200).notNull(),
  qrSecret: text('qr_secret').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const participants = pgTable('participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  phone: text('phone'),
  isRegistered: boolean('is_registered').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  participantId: uuid('participant_id').references(() => participants.id, { onDelete: 'cascade' }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  status: attendanceStatusEnum('status').default('VALID').notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Users no longer directly own attendances, they are linked via participants' email if needed
}));

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(participants),
  attendances: many(attendance),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  event: one(events, {
    fields: [participants.eventId],
    references: [events.id],
  }),
  attendances: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
  participant: one(participants, {
    fields: [attendance.participantId],
    references: [participants.id],
  }),
}));
