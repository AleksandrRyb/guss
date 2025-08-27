import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from './users.schema';
import { users } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) {}

  async findByUsername(username: string) {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user ?? undefined;
  }

  async create(username: string, passwordHash: string) {
    const [created] = await this.db.insert(users).values({ username, passwordHash }).returning();
    return created;
  }
}


