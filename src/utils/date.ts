import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formattedDate(date: string, withTime = false): string {
  return format(
    new Date(date),
    withTime ? "dd MMM yyyy' às 'HH:mm'" : 'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );
}
