import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import API_BASE_URL from '../../config/api';
import styles from './surpresaStyles';

const Surpresa = ({ onSelectReceita, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceitaSurpresa = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/receitas/surpresa`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar receita surpresa');
        }

        const data = await response.json();

        if (data.sucesso && data.receita) {
          // Redireciona diretamente para a receita sorteada
          onSelectReceita(data.receita.id);
        } else {
          setError('Nenhuma receita encontrada');
        }
      } catch (err) {
        console.error('Erro ao buscar receita surpresa:', err);
        setError(err.message || 'Erro ao buscar receita surpresa');
        // Volta para a home após 2 segundos em caso de erro
        setTimeout(() => {
          onBack();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchReceitaSurpresa();
  }, [onSelectReceita, onBack]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D2691E" />
    </View>
  );
};

export default Surpresa;
