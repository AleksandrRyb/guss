import { Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards, Param, NotFoundException, Req } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/auth.constants';
import { AuthGuard } from '@nestjs/passport';
import { ROUNDS, type RoundStatus } from '../../common/constants/rounds.constants';

@Controller('rounds')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(ROLES.admin)
  @HttpCode(HttpStatus.CREATED)
  async create() {
    const round = await this.roundsService.createRound();
    return round;
  }

  @Get()
  async list(@Query('status') status?: string) {
    const statuses = (status?.split(',') as RoundStatus[]) ?? [ROUNDS.STATUS.cooldown, ROUNDS.STATUS.active, ROUNDS.STATUS.finished];
    const list = await this.roundsService.listByStatuses(statuses);
    return list;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const round = await this.roundsService.getById(id);
    if (!round) {
      throw new NotFoundException('ROUND_NOT_FOUND');
    }
    return round;
  }

  @Post(':id/tap')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async tap(@Param('id') id: string, @Req() req: { user: { sub: string; username: string; role?: string } }) {
    const user = req.user;
    const res = await this.roundsService.tapRound(id, user);
    return res;
  }
}

