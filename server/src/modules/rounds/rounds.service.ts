import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../../common/database/database.module';
import { rounds, type Round } from './rounds.schema';
import { inArray } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { ROUNDS, type RoundStatus } from '../../common/constants/rounds.constants';

@Injectable()
export class RoundsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase,
    private readonly config: ConfigService,
  ) {}

  async createRound(): Promise<Round> {
    const now = new Date();
    const cooldown = Number(this.config.get<string>(ROUNDS.ENV.COOLDOWN));
    const duration = Number(this.config.get<string>(ROUNDS.ENV.DURATION));
    const startAt = new Date(now.getTime() + cooldown * 1000);
    const endAt = new Date(now.getTime() + (cooldown + duration) * 1000);
    const [created] = await this.db
      .insert(rounds)
      .values({ startAt, endAt, cooldownSec: cooldown, durationSec: duration, status: ROUNDS.STATUS.cooldown })
      .returning();
    return created;
  }

  async listByStatuses(statuses: RoundStatus[]): Promise<Round[]> {
    return this.db.select().from(rounds).where(inArray(rounds.status, statuses));
  }
}


