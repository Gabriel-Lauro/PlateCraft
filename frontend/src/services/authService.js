import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
  // Fazer login
  async login(email, senha) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao fazer login');
      }

      // Guardar token e dados do usuário
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.usuario));

      return {
        sucesso: true,
        token: data.token,
        usuario: data.usuario,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },

  // Fazer registro
  async registro(nome, email, senha) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao registrar');
      }

      // Guardar token e dados do usuário
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.usuario));

      return {
        sucesso: true,
        token: data.token,
        usuario: data.usuario,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },

  // Obter token armazenado
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  // Obter dados do usuário armazenados
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  },

  // Verificar se o token é válido
  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Atualizar dados do usuário
      if (data.usuario) {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.usuario));
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  },

  // Obter perfil do usuário
  async getPerfil(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao obter perfil');
      }

      return {
        sucesso: true,
        usuario: data.usuario,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },

  // Fazer logout
  async logout() {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      return { sucesso: true };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },

  // Editar perfil do usuário
  async editarPerfil(token, dados) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao editar perfil');
      }

      // Atualizar dados do usuário armazenados
      if (data.usuario) {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.usuario));
      }

      return {
        sucesso: true,
        usuario: data.usuario,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },
};
