import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import type { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findByUsername(username);
  }

  async createUser(username: string, passwordHash: string): Promise<User> {
    return this.usersRepository.create(username, passwordHash);
  }
}


