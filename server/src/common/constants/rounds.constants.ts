export const ROUNDS = {
  STATUS: {
    cooldown: 'cooldown',
    active: 'active',
    finished: 'finished',
  },
  ENV: {
    DURATION: 'ROUND_DURATION',
    COOLDOWN: 'COOLDOWN_DURATION',
  },
  SCORING: {
    BASE_POINTS: 1,
    BONUS_INTERVAL: 10,
    BONUS_POINTS: 10,
  },
} as const;

export type RoundStatus = typeof ROUNDS.STATUS[keyof typeof ROUNDS.STATUS];


