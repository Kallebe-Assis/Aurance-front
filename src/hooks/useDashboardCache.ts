import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  maxAge: number;
}

class DashboardCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, maxAge: number = this.DEFAULT_MAX_AGE): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge
    });
    
    // Salvar no localStorage também
    try {
      localStorage.setItem(`dashboard_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        maxAge
      }));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    // Primeiro tenta do cache em memória
    const cached = this.cache.get(key);
    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    // Se não estiver em memória ou expirado, tenta do localStorage
    try {
      const stored = localStorage.getItem(`dashboard_cache_${key}`);
      if (stored) {
        const parsed: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(parsed)) {
          // Restaurar no cache em memória
          this.cache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }

    return null;
  }

  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.maxAge;
  }

  clear(): void {
    this.cache.clear();
    // Limpar localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dashboard_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  isStale(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return true;
    return !this.isValid(cached);
  }
}

const dashboardCache = new DashboardCache();

export function useDashboardCache() {
  const [loading, setLoading] = useState(false);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    return dashboardCache.get<T>(key);
  }, []);

  const setCachedData = useCallback(<T>(key: string, data: T, maxAge?: number): void => {
    dashboardCache.set(key, data, maxAge);
  }, []);

  const clearCache = useCallback(() => {
    dashboardCache.clear();
  }, []);

  const isStale = useCallback((key: string): boolean => {
    return dashboardCache.isStale(key);
  }, []);

  const loadDataWithCache = useCallback(async <T>(
    key: string,
    fetchFunction: () => Promise<T>,
    maxAge?: number
  ): Promise<T> => {
    // Verificar cache primeiro
    const cached = getCachedData<T>(key);
    if (cached && !isStale(key)) {
      console.log(`📦 Usando dados do cache para ${key}`);
      return cached;
    }

    console.log(`🔄 Carregando dados da API para ${key}`);
    setLoading(true);
    
    try {
      const data = await fetchFunction();
      setCachedData(key, data, maxAge);
      return data;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, isStale]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isStale,
    loadDataWithCache,
    loading
  };
}
