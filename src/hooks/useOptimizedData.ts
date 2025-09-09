import { useState, useEffect, useCallback } from 'react';
import { useDashboardCache } from './useDashboardCache';

interface UseOptimizedDataOptions {
  key: string;
  fetchFunction: () => Promise<any>;
  maxAge?: number;
  dependencies?: any[];
}

export function useOptimizedData<T>({
  key,
  fetchFunction,
  maxAge = 5 * 60 * 1000, // 5 minutos
  dependencies = []
}: UseOptimizedDataOptions) {
  const { loadDataWithCache, loading: cacheLoading } = useDashboardCache();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loadDataWithCache(key, fetchFunction, maxAge);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, maxAge, loadDataWithCache]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading: loading || cacheLoading,
    error,
    refresh
  };
}
