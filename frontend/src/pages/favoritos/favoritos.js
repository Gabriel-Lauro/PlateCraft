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
import styles from './favoritosStyles';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import PageHeader from '../../components/PageHeader/PageHeader';
import ReceitaCard from '../../components/ReceitaCard/ReceitaCard';
import BottomNav from '../../components/BottomNav/BottomNav';
import API_BASE_URL from '../../config/api';
import NoInternet from '../noInternet/noInternet';
import { useAuth } from '../../hooks/useAuth';
import { favoritosService } from '../../services/favoritosService';

const Favoritos = ({ onBack, onSelectReceita, activeTab, setActiveTab }) => {
  const { token } = useAuth();
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [mostrando, setMostrando] = useState(0);
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

  // Buscar receitas favoritas do servidor
  const fetchFavoritos = useCallback(async (pageNum = 1) => {
    if (!token) {
      Alert.alert('Erro', 'Você precisa estar logado para ver favoritos');
      return;
    }

    try {
      const url = `${API_BASE_URL}/receitas/favoritos?pagina=${pageNum}`;
      
      console.log('Buscando favoritos:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();

      console.log('Resposta recebida:', data);

      if (data.sucesso) {
        if (pageNum === 1) {
          setReceitas(data.receitas || []);
        } else {
          setReceitas(prev => [...prev, ...(data.receitas || [])]);
        }

        setTotal(data.total || 0);
        setMostrando(data.mostrando || 0);
        setHasMore(data.tem_mais || false);
        setPagina(pageNum);
        setHasInternet(true);
      } else {
        Alert.alert('Erro', data.mensagem || 'Erro ao buscar favoritos');
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      setHasInternet(false);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token]);

  // Carregar favoritos iniciais
  useEffect(() => {
    fetchFavoritos(1);
  }, []);

  // Botão físico de voltar do Android
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) onBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack]);

  // Infinite scroll - carregar mais quando chegar perto do final
  const handleEndReached = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchFavoritos(pagina + 1);
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
          // Remover da lista de favoritos
          setReceitas(prev => prev.filter(r => r.id !== receitaId));
          setTotal(prev => prev - 1);
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
          fetchFavoritos(1);
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
        <PageHeader title="Minhas Receitas Favoritas" onBack={onBack} />

        {/* Conteúdo principal */}
        {loading ? (
          renderSkeleton()
        ) : receitas.length === 0 ? (
          <View style={styles.contentWrapper}>
            <View style={styles.emptyContainer}>
              <Icon name="heart-outline" size={70} color="#CD7F32" />
              <Text style={styles.emptyText}>
                Nenhuma receita favoritada
              </Text>
              <Text style={styles.emptySubtext}>
                Favorite receitas para vê-las aqui
              </Text>
            </View>
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

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </LinearGradient>
    </View>
  );
};

export default Favoritos;
