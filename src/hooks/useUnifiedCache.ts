import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live em milissegundos
  key: string;
  maxSize?: number; // Tamanho máximo do cache em memória
}

class UnifiedCache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly DEFAULT_MAX_SIZE = 100; // 100 itens em memória
  private readonly STORAGE_PREFIX = 'aurance_cache_';

  constructor() {
    // Limpar cache expirado na inicialização
    this.cleanExpiredCache();
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      key
    };

    // Salvar em memória
    this.memoryCache.set(key, cacheItem);

    // Salvar no localStorage (apenas dados pequenos)
    if (this.shouldStoreInLocalStorage(data)) {
      try {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}${key}`, 
          JSON.stringify(cacheItem)
        );
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
      }
    }

    // Limitar tamanho do cache em memória
    this.enforceMaxSize();
  }

  get<T>(key: string): T | null {
    // Primeiro tenta do cache em memória
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Se não estiver em memória ou expirado, tenta do localStorage
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (stored) {
        const parsed: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(parsed)) {
          // Restaurar no cache em memória
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          // Remover item expirado
          localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar do localStorage:', error);
    }

    return null;
  }

  private isValid(item: CacheItem<any>): boolean {
    return Date.now() <= item.expiresAt;
  }

  private shouldStoreInLocalStorage(data: any): boolean {
    // Não armazenar dados muito grandes no localStorage
    const size = JSON.stringify(data).length;
    return size < 100000; // 100KB
  }

  private enforceMaxSize(): void {
    if (this.memoryCache.size > this.DEFAULT_MAX_SIZE) {
      // Remover itens mais antigos
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.DEFAULT_MAX_SIZE);
      toRemove.forEach(([key]) => {
        this.memoryCache.delete(key);
      });
    }
  }

  private cleanExpiredCache(): void {
    // Limpar cache em memória expirado
    for (const [key, item] of Array.from(this.memoryCache.entries())) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Limpar localStorage expirado
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.expiresAt && Date.now() > item.expiresAt) {
              localStorage.removeItem(key);
            }
          } catch {
            // Se não conseguir parsear, remove
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache expirado:', error);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    
    // Limpar localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }

  isStale(key: string): boolean {
    const item = this.memoryCache.get(key);
    if (!item) return true;
    return !this.isValid(item);
  }

  getStats(): { memorySize: number; localStorageKeys: number } {
    let localStorageKeys = 0;
    try {
      const keys = Object.keys(localStorage);
      localStorageKeys = keys.filter(key => key.startsWith(this.STORAGE_PREFIX)).length;
    } catch {
      localStorageKeys = 0;
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageKeys
    };
  }
}

// Instância global do cache
const unifiedCache = new UnifiedCache();

export function useUnifiedCache<T>(options: CacheOptions) {
  const { ttl = 5 * 60 * 1000, key, maxSize = 100 } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para carregar dados
  const loadData = useCallback(async (
    fetchFunction: () => Promise<T>, 
    forceRefresh = false
  ): Promise<T> => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    // Se não forçar refresh, tentar carregar do cache primeiro
    if (!forceRefresh) {
      const cachedData = unifiedCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
        setError(null);
        return cachedData;
      }
    }

    // Se não há cache válido, buscar da API
    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      const freshData = await fetchFunction();
      
      // Verificar se a requisição foi cancelada
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Requisição cancelada');
      }

      unifiedCache.set(key, freshData, ttl);
      setData(freshData);
      return freshData;
    } catch (err) {
      if (err instanceof Error && err.message !== 'Requisição cancelada') {
        setError(err.message);
        console.error('Erro ao carregar dados:', err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, ttl]);

  // Função para limpar cache específico
  const clearCache = useCallback(() => {
    unifiedCache.clear();
    setData(null);
    setIsFromCache(false);
  }, []);

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((): boolean => {
    return !unifiedCache.isStale(key);
  }, [key]);

  // Função para forçar refresh
  const refresh = useCallback((fetchFunction: () => Promise<T>) => {
    return loadData(fetchFunction, true);
  }, [loadData]);

  // Carregar dados do cache na inicialização
  useEffect(() => {
    const cachedData = unifiedCache.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      setIsFromCache(true);
    }
  }, [key]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isFromCache,
    error,
    loadData,
    clearCache,
    isCacheValid,
    refresh,
    stats: unifiedCache.getStats()
  };
}

// Hooks específicos para diferentes tipos de dados
export function useExpensesCache(monthKey?: string) {
  return useUnifiedCache<any[]>({
    key: `expenses_${monthKey || 'all'}`,
    ttl: 2 * 60 * 1000 // 2 minutos
  });
}

export function useIncomesCache(monthKey?: string) {
  return useUnifiedCache<any[]>({
    key: `incomes_${monthKey || 'all'}`,
    ttl: 2 * 60 * 1000 // 2 minutos
  });
}

export function useCategoriesCache() {
  return useUnifiedCache<any[]>({
    key: 'categories',
    ttl: 10 * 60 * 1000 // 10 minutos (mudam pouco)
  });
}

export function useBankAccountsCache() {
  return useUnifiedCache<any[]>({
    key: 'bank_accounts',
    ttl: 5 * 60 * 1000 // 5 minutos
  });
}

export function useCreditCardsCache() {
  return useUnifiedCache<any[]>({
    key: 'credit_cards',
    ttl: 3 * 60 * 1000 // 3 minutos
  });
}

export function useTransfersCache() {
  return useUnifiedCache<any[]>({
    key: 'transfers',
    ttl: 2 * 60 * 1000 // 2 minutos
  });
}

export function useDashboardCache() {
  return useUnifiedCache<any>({
    key: 'dashboard_data',
    ttl: 1 * 60 * 1000 // 1 minuto
  });
}

// Função para limpar todo o cache
export function clearAllCache(): void {
  unifiedCache.clear();
}

// Função para obter estatísticas do cache
export function getCacheStats() {
  return unifiedCache.getStats();
}
