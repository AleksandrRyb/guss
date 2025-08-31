import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '../lib/api/auth'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  username: z.string().min(2, 'Минимум 2 символа'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const navigate = useNavigate()
  const { mutate: mutateLogin, isError, error, isPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: (values: FormValues) => login(values.username, values.password),
    onError: (e: Error) => {
      console.log(e)
    },
    onSuccess: () => {
      navigate('/')
    },
  })

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-background text-foreground">
      <form onSubmit={handleSubmit((values) => mutateLogin(values))} className="w-full max-w-sm space-y-4 p-6 rounded-md border">
        <div className="space-y-2">
          <label className="text-sm font-medium">Имя пользователя</label>
          <input className="w-full border rounded px-3 py-2 bg-background" placeholder="admin" {...register('username')} />
          {formState.errors.username && (
            <p className="text-sm text-red-500">{formState.errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Пароль</label>
          <input type="password" className="w-full border rounded px-3 py-2 bg-background" placeholder="******" {...register('password')} />
          {formState.errors.password && (
            <p className="text-sm text-red-500">{formState.errors.password.message}</p>
          )}
        </div>
        {isError && <p className="text-sm text-red-500">{error.message}</p>}
        <button type="submit" className="w-full h-10 rounded bg-primary text-primary-foreground disabled:opacity-50" disabled={formState.isSubmitting || isPending}>
          {formState.isSubmitting || isPending ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}


