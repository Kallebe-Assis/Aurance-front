import { useState, useCallback } from 'react';

interface GlobalLoadingState {
  isLoading: boolean;
  message: string;
}

export const useGlobalLoading = () => {
  const [loadingState, setLoadingState] = useState<GlobalLoadingState>({
    isLoading: true,
    message: 'Carregando...'
  });

  const setLoading = useCallback((isLoading: boolean, message: string = 'Carregando...') => {
    setLoadingState({ isLoading, message });
  }, []);

  const setLoadingMessage = useCallback((message: string) => {
    setLoadingState(prev => ({ ...prev, message }));
  }, []);

  return {
    ...loadingState,
    setLoading,
    setLoadingMessage
  };
};
