import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Verificar se há token armazenado ao iniciar
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const tokenArmazenado = await authService.getToken();
        const usuarioArmazenado = await authService.getUserData();

        if (tokenArmazenado) {
          // Verificar se o token ainda é válido
          const tokenValido = await authService.verifyToken(tokenArmazenado);
          
          if (tokenValido) {
            setToken(tokenArmazenado);
            setUsuario(usuarioArmazenado);
          } else {
            // Token inválido, fazer logout
            await authService.logout();
            setToken(null);
            setUsuario(null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        setToken(null);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, []);

  const login = useCallback(async (email, senha) => {
    setErro(null);
    try {
      const resultado = await authService.login(email, senha);
      
      if (resultado.sucesso) {
        setToken(resultado.token);
        setUsuario(resultado.usuario);
        return { sucesso: true };
      } else {
        setErro(resultado.erro);
        return { sucesso: false, erro: resultado.erro };
      }
    } catch (error) {
      const mensagem = error.message || 'Erro ao fazer login';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    }
  }, []);

  const registro = useCallback(async (nome, email, senha) => {
    setErro(null);
    try {
      const resultado = await authService.registro(nome, email, senha);
      
      if (resultado.sucesso) {
        setToken(resultado.token);
        setUsuario(resultado.usuario);
        return { sucesso: true };
      } else {
        setErro(resultado.erro);
        return { sucesso: false, erro: resultado.erro };
      }
    } catch (error) {
      const mensagem = error.message || 'Erro ao registrar';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setToken(null);
      setUsuario(null);
      setErro(null);
      return { sucesso: true };
    } catch (error) {
      const mensagem = error.message || 'Erro ao fazer logout';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    }
  }, []);

  const editarPerfil = useCallback(async (dados) => {
    setErro(null);
    try {
      if (!token) {
        throw new Error('Token não disponível');
      }

      const resultado = await authService.editarPerfil(token, dados);
      
      if (resultado.sucesso) {
        setUsuario(resultado.usuario);
        return { sucesso: true };
      } else {
        setErro(resultado.erro);
        return { sucesso: false, erro: resultado.erro };
      }
    } catch (error) {
      const mensagem = error.message || 'Erro ao editar perfil';
      setErro(mensagem);
      return { sucesso: false, erro: mensagem };
    }
  }, [token]);

  const value = {
    token,
    usuario,
    loading,
    erro,
    login,
    registro,
    logout,
    editarPerfil,
    isAutenticado: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
