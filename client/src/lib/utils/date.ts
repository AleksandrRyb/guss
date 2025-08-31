import { format } from 'date-fns'

export function formatDateTimeISO(input: string): string {
  return format(new Date(input), 'dd.MM.yyyy, HH:mm:ss')
}


