import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getRoundById, tapRound } from '../lib/api/rounds'
import { useEffect, useRef, useState } from 'react'
import { useRoundTimer } from '../hooks/use-round-timer'
import { ROUNDS, ROUND_STATUS_LABEL_RU } from '../lib/constants/rounds'
import { TapZone } from '../components/tap-zone'
import { Loader2 } from 'lucide-react'

export function RoundPage() {
  const { id } = useParams<{ id: string }>()
  const { data, refetch, isLoading, isError } = useQuery({ queryKey: ['round', id], queryFn: () => getRoundById(id!), staleTime: 1000 })
  const timer = useRoundTimer(data)
  const splashRef = useRef<HTMLDivElement | null>(null)
  const [myTaps, setMyTaps] = useState<number>(0)
  const [myScore, setMyScore] = useState<number>(0)
  const navigate = useNavigate()

  const tapMut = useMutation({
    mutationKey: ['tap', id],
    mutationFn: () => tapRound(id!),
    onSuccess: (res) => {
      setMyTaps(res.taps)
      setMyScore(res.score)
    },
  })

  function handleTap() {
    if (timer.phase !== ROUNDS.STATUS.active || tapMut.isPending) return
    tapMut.mutate()
  }

  useEffect(() => {
    if (timer.phase === ROUNDS.STATUS.finished) {
      refetch()
    }
  }, [timer.phase, refetch])

  // Poll for stats after finish until stats appear
  const statsPoll = useQuery({
    queryKey: ['round', id, 'stats'],
    queryFn: () => getRoundById(id!),
    enabled: timer.phase === ROUNDS.STATUS.finished && !data?.stats,
    refetchInterval: (q) => (!q.state.data?.stats ? 1000 : false),
  })

  if (isLoading) return <div className="p-4">Загрузка...</div>
  if (isError || !data) return <div className="p-4 text-red-500">Ошибка загрузки</div>

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <div className="w-full border-b px-4 h-14 flex items-center justify-between">
        <button className="text-sm opacity-80 hover:opacity-100" onClick={() => navigate(-1)}>← Назад</button>
        <div className="text-base md:text-lg font-semibold text-center">Раунд {data.id}</div>
        <div className="w-10" />
      </div>

      <div ref={splashRef}>
        <TapZone isEnabled={timer.phase === ROUNDS.STATUS.active} onTap={handleTap} />
      </div>

      <div className="px-4 pb-6 space-y-2 text-sm">
        <div>Статус: {ROUND_STATUS_LABEL_RU[timer.phase]}</div>
        {timer.phase !== ROUNDS.STATUS.finished && (
          <div>
            Таймер: {timer.phase === ROUNDS.STATUS.cooldown ? 'до начала' : 'до конца'} — {timer.seconds}s
          </div>
        )}
        {timer.phase === ROUNDS.STATUS.active && (
          <div className="mt-2 space-x-4"><span>Мои тапов: {myTaps}</span><span>Общий счет: {myScore}</span></div>
        )}

        {timer.phase === ROUNDS.STATUS.finished && !data.stats && !statsPoll.data?.stats && (
          <div className="mt-4 border rounded p-3 flex items-center gap-2 text-sm opacity-80">
            <Loader2 className="animate-spin" size={16} /> Загружаем статистику раунда...
          </div>
        )}

        {(data.status === ROUNDS.STATUS.finished && data.stats) || statsPoll.data?.stats ? (
          <div className="mt-4 border rounded p-3">
            <div>Всего игроков: {statsPoll.data?.stats?.playersTotal ?? data.stats?.playersTotal}</div>
            <div>Всего тапов: {statsPoll.data?.stats?.tapsTotal ?? data.stats?.tapsTotal}</div>
            <div>Всего очков: {statsPoll.data?.stats?.scoreTotal ?? data.stats?.scoreTotal}</div>
            {((statsPoll.data?.stats?.winner) || (data.stats?.winner)) && (
              <div>Победитель: {(statsPoll.data?.stats?.winner ?? data.stats!.winner).username} — {(statsPoll.data?.stats?.winner ?? data.stats!.winner).score}</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}


