import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live em milissegundos
  key: string;
}

const CACHE_PREFIX = 'aurance_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

export function useCache<T>(options: CacheOptions) {
  const { ttl = DEFAULT_TTL, key } = options;
  const cacheKey = `${CACHE_PREFIX}${key}`;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // Função para salvar no cache
  const setCache = useCallback((newData: T) => {
    const cacheItem: CacheItem<T> = {
      data: newData,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      setData(newData);
      setIsFromCache(false);
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }, [cacheKey, ttl]);

  // Função para carregar do cache
  const getCache = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Verificar se o cache expirou
      if (Date.now() > cacheItem.expiresAt) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Erro ao carregar do cache:', error);
      return null;
    }
  }, [cacheKey]);

  // Função para limpar o cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(cacheKey);
      setData(null);
      setIsFromCache(false);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, [cacheKey]);

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((): boolean => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return false;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      return Date.now() <= cacheItem.expiresAt;
    } catch (error) {
      return false;
    }
  }, [cacheKey]);

  // Função para carregar dados (primeiro do cache, depois da API)
  const loadData = useCallback(async (fetchFunction: () => Promise<T>, forceRefresh = false) => {
    // Se não forçar refresh, tentar carregar do cache primeiro
    if (!forceRefresh) {
      const cachedData = getCache();
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
        return cachedData;
      }
    }

    // Se não há cache válido, buscar da API
    setIsLoading(true);
    try {
      const freshData = await fetchFunction();
      setCache(freshData);
      return freshData;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCache, setCache]);

  // Carregar dados do cache na inicialização
  useEffect(() => {
    const cachedData = getCache();
    if (cachedData) {
      setData(cachedData);
      setIsFromCache(true);
    }
  }, [getCache]);

  return {
    data,
    isLoading,
    isFromCache,
    setCache,
    getCache,
    clearCache,
    isCacheValid,
    loadData
  };
}

// Hook específico para cache de cartões
export function useCreditCardsCache() {
  return useCache<any[]>({
    key: 'credit_cards',
    ttl: 2 * 60 * 1000 // 2 minutos para cartões
  });
}

// Hook específico para cache de despesas
export function useExpensesCache(monthKey: string) {
  return useCache<any[]>({
    key: `expenses_${monthKey}`,
    ttl: 1 * 60 * 1000 // 1 minuto para despesas
  });
}

// Hook específico para cache de categorias
export function useCategoriesCache() {
  return useCache<any[]>({
    key: 'categories',
    ttl: 10 * 60 * 1000 // 10 minutos para categorias (mudam pouco)
  });
}

// Hook específico para cache de contas bancárias
export function useBankAccountsCache() {
  return useCache<any[]>({
    key: 'bank_accounts',
    ttl: 10 * 60 * 1000 // 10 minutos para contas bancárias
  });
}
