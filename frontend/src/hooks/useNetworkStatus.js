import { useState, useCallback } from 'react';
import { checkInternetConnection } from '../services/networkService';

/**
 * Hook para gerenciar o status de conexão com a internet
 * @returns {object} { hasInternet, isChecking, checkConnection, setHasInternet }
 */
export const useNetworkStatus = () => {
  const [hasInternet, setHasInternet] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const isConnected = await checkInternetConnection();
      setHasInternet(isConnected);
      return isConnected;
    } catch (error) {
      console.log('Erro ao verificar conexão:', error);
      setHasInternet(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    hasInternet,
    isChecking,
    checkConnection,
    setHasInternet,
  };
};
