import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, isAdmin } from '../lib/utils/auth'
import { getRounds, createRound } from '../lib/api/rounds'
import { formatDateTimeISO } from '../lib/utils/date'
import { Loader2 } from 'lucide-react'

export function HomePage() {
  const queryClient = useQueryClient()
  const user = getCurrentUser()

  const roundsQuery = useQuery({
    queryKey: ['rounds'],
    queryFn: getRounds,
  })

  const createRoundMut = useMutation({
    mutationKey: ['createRound'],
    mutationFn: createRound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] })
    },
  })

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <div className="w-full border-b px-4 h-14 flex items-center justify-between">
        <div className="text-lg font-semibold">Список РАУНДОВ</div>
        <div className="text-sm opacity-80">{user?.username ?? 'unknown'}</div>
      </div>

      <div className="p-4">
        {isAdmin() && (
          <div className="mb-4">
            <button
              className="h-9 px-3 rounded bg-primary text-primary-foreground disabled:opacity-50"
              disabled={createRoundMut.isPending}
              onClick={() => createRoundMut.mutate()}
            >
              {createRoundMut.isPending ? 'Создание...' : 'Создать раунд'}
            </button>
          </div>
        )}

        {roundsQuery.isLoading && (
          <div className="flex items-center gap-2 text-sm opacity-80"><Loader2 className="animate-spin" size={18} /> Загрузка...</div>
        )}
        {roundsQuery.isError && <div className="text-red-500">Ошибка загрузки раундов</div>}
        <div className="grid grid-cols-1 gap-6">
          {roundsQuery.data?.map((r) => (
            <div key={r.id} className="border rounded-md p-4 bg-card text-card-foreground">
              <div className="text-sm font-mono opacity-70">● Round ID: {r.id}</div>
              <div className="mt-4 text-sm">Start: {formatDateTimeISO(r.startAt)}</div>
              <div className="text-sm">End: {formatDateTimeISO(r.endAt)}</div>
              <div className="my-4 h-px bg-border" />
              <div className="text-sm">Статус: {r.status === 'active' ? 'Активен' : r.status === 'cooldown' ? 'Cooldown' : 'Завершен'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


