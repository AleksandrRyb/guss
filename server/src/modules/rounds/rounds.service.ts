import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../../common/database/database.module';
import { roundStats, rounds, type Round } from './rounds.schema';
import { inArray, eq as dEq } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { ROUNDS, type RoundStatus } from '../../common/constants/rounds.constants';
import { ROLES } from '../../common/constants/auth.constants';
import { eq } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RoundsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase,
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RoundsService.name);
  }

  async createRound(): Promise<Round> {
    const now = new Date();
    const cooldown = Number(this.config.get<string>(ROUNDS.ENV.COOLDOWN));
    const duration = Number(this.config.get<string>(ROUNDS.ENV.DURATION));
    const startAt = new Date(now.getTime() + cooldown * 1000);
    const endAt = new Date(now.getTime() + (cooldown + duration) * 1000);
    const [created] = await this.db
      .insert(rounds)
      .values({ startAt, endAt, status: ROUNDS.STATUS.cooldown })
      .returning();
    return created;
  }

  async listByStatuses(statuses: RoundStatus[]): Promise<Round[]> {
    return this.db.select().from(rounds).where(inArray(rounds.status, statuses));
  }

  async getById(id: string): Promise<{
    id: string;
    status: string;
    startAt: Date;
    endAt: Date;
    secondsUntilStart: number;
    secondsUntilEnd: number;
    stats?: {
      playersTotal: number;
      tapsTotal: number;
      scoreTotal: number;
      winner?: { userId: string; username: string; score: number };
    };
  } | null> {
    const [found] = await this.db.select().from(rounds).where(eq(rounds.id, id));
    if (!found) {
      return null;
    }
    const now = new Date();
    const startAt = new Date(found.startAt as unknown as string);
    const endAt = new Date(found.endAt as unknown as string);
    const secondsUntilStart = Math.max(0, Math.floor((startAt.getTime() - now.getTime()) / 1000));
    const secondsUntilEnd = Math.max(0, Math.floor((endAt.getTime() - now.getTime()) / 1000));
    const base = {
      id: found.id,
      status: found.status,
      startAt: found.startAt,
      endAt: found.endAt,
      secondsUntilStart,
      secondsUntilEnd,
    };
    if (found.status === ROUNDS.STATUS.finished) {
      const [st] = await this.db.select().from(roundStats).where(dEq(roundStats.roundId, found.id));
      if (st) {
        return {
          ...base,
          stats: {
            playersTotal: st.playersTotal,
            tapsTotal: st.tapsTotal,
            scoreTotal: st.scoreTotal,
            winner: st.winnerUserId ? { userId: st.winnerUserId, username: st.winnerUsername ?? 'unknown', score: st.winnerScore ?? 0 } : undefined,
          },
        };
      }
    }
    return base;
  }

  async tapRound(roundId: string, user: { sub: string; username: string; role?: string }) {
    // Verify round exists and is active (single-round lock)
    const [found] = await this.db.select().from(rounds).where(dEq(rounds.id, roundId));
    
    if (!found) return { error: 'ROUND_NOT_FOUND' };

    if (found.status !== ROUNDS.STATUS.active) {
      return { error: 'ROUND_NOT_ACTIVE' };
    }

    // Use SQL upsert with atomic increment for concurrency safety
    // Implement via raw SQL for brevity with drizzle
    const isNikita = (user.role === ROLES.nikita);
    const base = 1;
    const bonusEvery = 10;
    const bonus = 10;
    // compute delta points on DB side requires previous taps; approximate by reading after update is fine for UI
    // For correctness of 10th tap bonus, we compute pre-tap taps: select first, then update accordingly inside a transaction.
    const result = await this.db.transaction(async (tx) => {
      const deltaCase = isNikita
        ? '0'
        : `CASE WHEN ((round_users.taps + 1) % ${bonusEvery}) = 0 THEN ${bonus} ELSE ${base} END`;
      const sqlText = `
        insert into round_users (round_id, user_id, taps, score, updated_at)
        values ('${roundId}', '${user.sub}', 1, ${isNikita ? 0 : base}, now())
        on conflict (round_id, user_id)
        do update set taps = round_users.taps + 1, score = round_users.score + ${deltaCase}, updated_at = now()
        returning taps, score
      `;
      const up: any = await tx.execute(sqlText);
      return { taps: up.rows[0].taps as number, score: up.rows[0].score as number };
    });

    return result;
  }
}


