import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../../common/database/database.module';
import { roundStats, rounds } from './rounds.schema';
import { ROUNDS } from '../../common/constants/rounds.constants';
import { and, eq, lte } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RoundsScheduler {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RoundsScheduler.name)
  }

  @Interval(1000)
  async promoteCooldownToActive(): Promise<void> {
    try {
      const now = new Date()
      await this.db
        .update(rounds)
        .set({ status: ROUNDS.STATUS.active })
        .where(and(eq(rounds.status, ROUNDS.STATUS.cooldown), lte(rounds.startAt, now)))
        .execute()
    } catch (err) {
      this.logger.error({ err }, 'promoteCooldownToActive error')
    }
  }

  @Interval(1000)
  async finishActiveRounds(): Promise<void> {
    try {
      const now = new Date()
      const res = await this.db
        .update(rounds)
        .set({ status: ROUNDS.STATUS.finished })
        .where(and(eq(rounds.status, ROUNDS.STATUS.active), lte(rounds.endAt, now)))
        .execute()
      // Aggregate stats for finished rounds (simple approach: recompute for all finished without stats)
      const finished = await this.db.select().from(rounds).where(eq(rounds.status, ROUNDS.STATUS.finished))
      for (const r of finished) {
        // skip if stats already exist
        const existing = await this.db.select().from(roundStats).where(eq(roundStats.roundId, r.id))


        if (existing.length > 0) continue
        const agg = await this.db.execute(
          `select count(*)::int as players_total, coalesce(sum(taps),0)::int as taps_total, coalesce(sum(score),0)::int as score_total from round_users where round_id = '${r.id}'`
        ) as unknown as { rows: Array<{ players_total: number; taps_total: number; score_total: number }> }


        const win = await this.db.execute(
          `select ru.user_id, u.username, ru.score as winner_score
           from round_users ru
           join users u on u.id = ru.user_id
           where ru.round_id = '${r.id}'
           order by ru.score desc nulls last limit 1`
        ) as unknown as { rows: Array<{ user_id: string; username: string; winner_score: number }> }


        const playersTotal = agg.rows?.[0]?.players_total ?? 0
        const tapsTotal = agg.rows?.[0]?.taps_total ?? 0
        const scoreTotal = agg.rows?.[0]?.score_total ?? 0
        await this.db.insert(roundStats).values({
          roundId: r.id,
          playersTotal,
          tapsTotal,
          scoreTotal,
          winnerUserId: win.rows?.[0]?.user_id ?? null,
          winnerUsername: win.rows?.[0]?.username ?? null,
          winnerScore: win.rows?.[0]?.winner_score ?? null,
        }).execute()
      }
    } catch (err) {
      this.logger.error({ err }, 'finishActiveRounds error')
    }
  }
}


