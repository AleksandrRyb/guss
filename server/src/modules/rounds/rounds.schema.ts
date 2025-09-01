import { pgTable, text, timestamp, uuid, index, integer, primaryKey } from 'drizzle-orm/pg-core';
import { ROUNDS } from 'src/common/constants/rounds.constants';

export const rounds = pgTable('rounds', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  status: text('status').notNull().default(ROUNDS.STATUS.cooldown),
}, (t) => ({
  statusStartIdx: index('rounds_status_start_idx').on(t.status, t.startAt),
  statusEndIdx: index('rounds_status_end_idx').on(t.status, t.endAt),
}));

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert;

// Per-user stats for a round
export const roundUsers = pgTable('round_users', {
  roundId: uuid('round_id').notNull(),
  userId: uuid('user_id').notNull(),
  taps: integer('taps').notNull().default(0),
  score: integer('score').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.roundId, t.userId], name: 'round_users_pk' }),
  byRoundScore: index('round_users_round_score_idx').on(t.roundId, t.score),
}));

export type RoundUser = typeof roundUsers.$inferSelect;
export type NewRoundUser = typeof roundUsers.$inferInsert;

// Aggregated stats per round
export const roundStats = pgTable('round_stats', {
  roundId: uuid('round_id').notNull(),
  playersTotal: integer('players_total').notNull().default(0),
  tapsTotal: integer('taps_total').notNull().default(0),
  scoreTotal: integer('score_total').notNull().default(0),
  winnerUserId: uuid('winner_user_id'),
  winnerUsername: text('winner_username'),
  winnerScore: integer('winner_score'),
}, (t) => ({
  pk: primaryKey({ columns: [t.roundId], name: 'round_stats_pk' }),
}));

export type RoundStats = typeof roundStats.$inferSelect;
export type NewRoundStats = typeof roundStats.$inferInsert;


