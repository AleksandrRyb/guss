export const ROUNDS = {
  STATUS: {
    cooldown: 'cooldown',
    active: 'active',
    finished: 'finished',
  },
} as const

export type RoundStatus = typeof ROUNDS.STATUS[keyof typeof ROUNDS.STATUS]

export const ROUND_STATUS_LABEL_RU: Record<RoundStatus, string> = {
  cooldown: 'Кулдаун',
  active: 'Активен',
  finished: 'Завершен',
}


