import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './resultsStyles';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import PageHeader from '../../components/PageHeader/PageHeader';
import ReceitaCard from '../../components/ReceitaCard/ReceitaCard';
import API_BASE_URL from '../../config/api';
import NoInternet from '../noInternet/noInternet';
import { useAuth } from '../../hooks/useAuth';
import { favoritosService } from '../../services/favoritosService';

const Results = ({ ingredientes, onBack, onSelectReceita }) => {
  const { token } = useAuth();
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasInternet, setHasInternet] = useState(true);
  const [favoritados, setFavoritados] = useState({});
  const flatListRef = useRef(null);

  // Carregar favoritos ao montar o componente
  useEffect(() => {
    carregarFavoritos();
  }, []);

  // Carregar favoritos do AsyncStorage
  const carregarFavoritos = async () => {
    try {
      const favoritosList = await favoritosService.getFavoritos();
      const favoritosMap = {};
      favoritosList.forEach(id => {
        favoritosMap[id] = true;
      });
      setFavoritados(favoritosMap);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  // Buscar receitas do servidor
  const fetchReceitas = useCallback(async (pageNum = 1) => {
    try {
      const ingredientesStr = ingredientes.map(ing => ing.trim()).join(',');
      const url = `${API_BASE_URL}/receitas?ingredientes=${ingredientesStr}&pagina=${pageNum}`;
      
      console.log('Buscando:', url);
      const response = await fetch(url);
      const data = await response.json();

      console.log('Resposta recebida:', data);

      if (pageNum === 1) {
        setReceitas(data.receitas || []);
      } else {
        setReceitas(prev => [...prev, ...(data.receitas || [])]);
      }

      // Verifica se tem mais resultados baseado no campo 'tem_mais' do backend
      setHasMore(data.tem_mais || false);
      setPagina(pageNum);
      setHasInternet(true);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      setHasInternet(false);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [ingredientes]);

  // Carregar receitas iniciais
  useEffect(() => {
    fetchReceitas(1);
  }, []);

  // Botão físico de voltar do Android
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) onBack();
      return true; // consumimos o evento
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack]);

  // Infinite scroll - carregar mais quando chegar perto do final
  const handleEndReached = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchReceitas(pagina + 1);
    }
  };

  // Favoritar/desfavoritar receita
  const handleFavoritar = async (receitaId, e) => {
    e.stopPropagation();
    
    if (!token) {
      Alert.alert('Erro', 'Você precisa estar logado para favoritar receitas');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/receitas/${receitaId}/favoritar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        // Atualizar estado local
        setFavoritados(prev => ({
          ...prev,
          [receitaId]: data.favoritado
        }));

        // Salvar no AsyncStorage
        if (data.favoritado) {
          await favoritosService.adicionarFavorito(receitaId);
        } else {
          await favoritosService.removerFavorito(receitaId);
        }
      } else {
        Alert.alert('Erro', data.mensagem || 'Erro ao favoritar receita');
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Erro ao favoritar receita');
    }
  };

  // Renderizar card de receita
  const renderReceitaCard = ({ item }) => (
    <ReceitaCard
      item={item}
      onPress={onSelectReceita}
      onFavoritar={handleFavoritar}
      isFavoritado={favoritados[item.id]}
      showDataFavoritado={false}
    />
  );

  // Renderizar skeleton loader
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map(index => (
        <SkeletonLoader key={index} />
      ))}
    </View>
  );

  // Renderizar footer com loading
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#CD7F32" />
      </View>
    );
  };

  // Se não tem internet, mostrar tela de sem internet
  if (!hasInternet) {
    return (
      <NoInternet 
        onRetry={() => {
          setHasInternet(true);
          setLoading(true);
          fetchReceitas(1);
        }} 
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <LinearGradient
        colors={['#FFFBF7', '#FFFFFF', '#FFF8F0']}
        style={styles.gradient}
      >
        {/* Header */}
        <PageHeader title="Receitas" onBack={onBack} />

        {/* Ingredientes selecionados */}
        <View style={styles.ingredientesContainer}>
          <Text style={styles.ingredientesLabel}>Ingredientes:</Text>
          <Text style={styles.ingredientesText}>
            {ingredientes.join(', ')}
          </Text>
        </View>

        {/* Lista de receitas */}
        {loading ? (
          renderSkeleton()
        ) : receitas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={70} color="#CD7F32" />
            <Text style={styles.emptyText}>
              Nenhuma receita encontrada com esses ingredientes
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={receitas}
            renderItem={renderReceitaCard}
            keyExtractor={(item, index) => `${item.id || index}`}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            scrollIndicatorInsets={{ right: 1 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </View>
  );
};

export default Results;
