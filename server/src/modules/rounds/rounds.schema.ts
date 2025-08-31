import { pgTable, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const rounds = pgTable('rounds', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('cooldown'),
  durationSec: integer('duration_sec').notNull(),
  cooldownSec: integer('cooldown_sec').notNull(),
  playersCount: integer('players_count').notNull().default(0),
  winnerUserId: uuid('winner_user_id'),
  totalTaps: integer('total_taps').notNull().default(0),
  totalScore: integer('total_score').notNull().default(0),
  version: integer('version').notNull().default(0),
});

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert;


