/**
 * Utilitários para manipulação de datas
 * Resolve problemas de fuso horário usando sempre data local
 */

/**
 * Formata uma data para o formato YYYY-MM-DD usando data local
 * @param date - Data a ser formatada (opcional, usa data atual se não fornecida)
 * @returns String no formato YYYY-MM-DD
 */
export const formatDateToLocal = (date?: Date): string => {
  const targetDate = date || new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data para o formato ISO string usando data local
 * @param date - Data a ser formatada (opcional, usa data atual se não fornecida)
 * @returns String no formato ISO com data local
 */
export const formatDateToLocalISO = (date?: Date): string => {
  const targetDate = date || new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const seconds = String(targetDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
};

/**
 * Converte uma string de data (YYYY-MM-DD) para objeto Date local
 * @param dateString - String no formato YYYY-MM-DD
 * @returns Objeto Date
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Converte uma data (string ou Date) para objeto Date local
 * @param date - String no formato YYYY-MM-DD, ISO string ou objeto Date
 * @returns Objeto Date
 */
export const parseLocalDateFlexible = (date: string | Date): Date => {
  if (typeof date === 'string') {
    // Se for uma string ISO (contém 'T'), extrair apenas a parte da data
    if (date.includes('T')) {
      const datePart = date.split('T')[0]; // Pega apenas "YYYY-MM-DD"
      return parseLocalDate(datePart);
    }
    // Se for formato YYYY-MM-DD, usar parseLocalDate diretamente
    return parseLocalDate(date);
  }
  // Se já é um Date, retorna uma nova instância para evitar mutação
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Obtém a data de hoje no formato YYYY-MM-DD
 * @returns String no formato YYYY-MM-DD
 */
export const getTodayString = (): string => {
  return formatDateToLocal();
};

/**
 * Obtém a data de hoje no formato ISO string local
 * @returns String no formato ISO com data local
 */
export const getTodayISOString = (): string => {
  return formatDateToLocalISO();
};
