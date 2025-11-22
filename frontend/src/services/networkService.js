import API_BASE_URL from '../config/api';

/**
 * Verifica se há conexão com a internet fazendo um ping na API
 * @returns {Promise<boolean>} true se há conexão, false caso contrário
 */
export const checkInternetConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/receitas?ingredientes=teste&pagina=1`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 200;
  } catch (error) {
    console.log('Erro ao verificar conexão:', error.message);
    return false;
  }
};

/**
 * Faz uma requisição com tratamento de erro de conexão
 * @param {string} url - URL da requisição
 * @param {object} options - Opções do fetch
 * @returns {Promise<Response>} Resposta da requisição
 * @throws {Error} Lança erro se não houver conexão
 */
export const fetchWithConnectionCheck = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: 10000,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.log('Erro na requisição:', error.message);
    throw error;
  }
};
