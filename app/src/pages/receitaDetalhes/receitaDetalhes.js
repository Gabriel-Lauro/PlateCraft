import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Linking,
  BackHandler,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './receitaDetalhesStyles';
import PageHeader from '../../components/PageHeader/PageHeader';
import SkeletonDetalhes from '../../components/SkeletonLoader/SkeletonDetalhes';
import API_BASE_URL from '../../config/api';
import NoInternet from '../noInternet/noInternet';
import { useAuth } from '../../hooks/useAuth';
import { favoritosService } from '../../services/favoritosService';

const ReceitaDetalhes = ({ receitaId, onBack }) => {
  const { token } = useAuth();
  const [receita, setReceita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInternet, setHasInternet] = useState(true);
  const [isFavoritado, setIsFavoritado] = useState(false);

  useEffect(() => {
    fetchReceitaDetalhes();
    verificarFavoritado();
  }, [receitaId]);

  // Verificar se a receita está favoritada
  const verificarFavoritado = async () => {
    try {
      const isFav = await favoritosService.isFavoritado(receitaId);
      setIsFavoritado(isFav);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  // Botão físico de voltar do Android
  useEffect(() => {
    const onBackPress = () => {
      if (onBack) onBack();
      return true; // consumimos o evento
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [onBack]);

  const fetchReceitaDetalhes = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/receitas/${receitaId}`;
      console.log('Buscando detalhes:', url);
      
      const startTime = Date.now();
      const response = await fetch(url);
      const data = await response.json();

      console.log('Detalhes recebidos:', data);

      // Garantir que o skeleton seja exibido por pelo menos 300ms
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 300;
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      if (data.sucesso && data.receita) {
        setReceita(data.receita);
        setHasInternet(true);
      } else {
        setError('Receita não encontrada');
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes:', err);
      setHasInternet(false);
      setError('Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirLink = () => {
    if (receita?.link) {
      Linking.openURL(receita.link).catch(err =>
        console.error('Erro ao abrir link:', err)
      );
    }
  };

  const handleFavoritar = async () => {
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
        setIsFavoritado(data.favoritado);
        
        // Salvar no AsyncStorage
        if (data.favoritado) {
          await favoritosService.adicionarFavorito(receitaId);
        } else {
          await favoritosService.removerFavorito(receitaId);
        }
        
        const mensagem = data.favoritado 
          ? 'Receita adicionada aos favoritos!' 
          : 'Receita removida dos favoritos';
        Alert.alert('Sucesso', mensagem);
      } else {
        Alert.alert('Erro', data.mensagem || 'Erro ao favoritar receita');
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Erro ao favoritar receita');
    }
  };

  // Se não tem internet, mostrar tela de sem internet
  if (!hasInternet) {
    return (
      <NoInternet 
        onRetry={() => {
          setHasInternet(true);
          setLoading(true);
          fetchReceitaDetalhes();
        }} 
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
        <LinearGradient
          colors={['#FFF8F0', '#FFFFFF', '#FFF5EB']}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SkeletonDetalhes />
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  if (error || !receita) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
        <LinearGradient
          colors={['#FFF8F0', '#FFFFFF', '#FFF5EB']}
          style={styles.gradient}
        >
          <PageHeader title="Receita" onBack={onBack} />
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={70} color="#CD7F32" />
            <Text style={styles.errorText}>{error || 'Erro ao carregar receita'}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      <LinearGradient
        colors={['#FFF8F0', '#FFFFFF', '#FFF5EB']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >


          {/* Imagem */}
          <View style={styles.imagemContainer}>
            {receita.imagem ? (
              <Image
                source={{ uri: receita.imagem }}
                style={styles.imagem}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagemPlaceholder}>
                <Icon name="image-outline" size={80} color="#CD7F32" />
              </View>
            )}
          </View>

          {/* Título e Botão de Favoritar */}
          <View style={styles.tituloContainer}>
            <View style={styles.tituloContent}>
              <Text style={styles.titulo}>{receita.titulo}</Text>
            </View>
            <TouchableOpacity 
              style={styles.favoritoButtonDetalhes}
              onPress={handleFavoritar}
            >
              <Icon 
                name={isFavoritado ? "heart" : "heart-outline"} 
                size={28} 
                color={isFavoritado ? "#FF6B6B" : "#D2691E"}
              />
            </TouchableOpacity>
          </View>

          {/* Informações principais */}
          {(receita.nota || receita.avaliacoes || receita.tempo_preparo) && (
            <View style={styles.infoContainer}>
              {receita.nota && receita.nota !== 'N/A' && (
                <View style={styles.infoItem}>
                  <Icon name="star" size={20} color="#CD7F32" />
                  <View style={styles.infoTexto}>
                    <Text style={styles.infoLabel}>Avaliação</Text>
                    <Text style={styles.infoValor}>{receita.nota}</Text>
                  </View>
                </View>
              )}

              {receita.avaliacoes && receita.avaliacoes !== 'N/A' && (
                <View style={styles.infoItem}>
                  <Icon name="chatbubble-outline" size={20} color="#CD7F32" />
                  <View style={styles.infoTexto}>
                    <Text style={styles.infoLabel}>Avaliações</Text>
                    <Text style={styles.infoValor}>
                      {receita.avaliacoes.match(/\d+\.?\d*/)?.[0] || receita.avaliacoes}
                    </Text>
                  </View>
                </View>
              )}

              {receita.tempo_preparo && receita.tempo_preparo !== 'N/A' && (
                <View style={styles.infoItem}>
                  <Icon name="time-outline" size={20} color="#CD7F32" />
                  <View style={styles.infoTexto}>
                    <Text style={styles.infoLabel}>Tempo</Text>
                    <Text style={styles.infoValor}>{receita.tempo_preparo}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Autor */}
          {receita.autor && (
            <View style={styles.autorContainer}>
              <Icon name="person-circle-outline" size={24} color="#CD7F32" />
              <View style={styles.autorTexto}>
                <Text style={styles.autorLabel}>Autor</Text>
                <Text style={styles.autorNome}>{receita.autor}</Text>
              </View>
            </View>
          )}

          {/* Descrição */}
          {receita.descricao && receita.descricao !== 'N/A' && (
            <View style={styles.secaoContainer}>
              <Text style={styles.secaoTitulo}>Descrição</Text>
              <Text style={styles.descricaoTexto}>{receita.descricao}</Text>
            </View>
          )}

          {/* Ingredientes */}
          {receita.ingredientes && receita.ingredientes.length > 0 && (
            <View style={styles.secaoContainer}>
              <Text style={styles.secaoTitulo}>Ingredientes</Text>
              {receita.ingredientes.map((ingrediente, index) => (
                <View key={index} style={styles.ingredienteItem}>
                  <Icon name="checkmark-circle" size={18} color="#CD7F32" />
                  <Text style={styles.ingredienteTexto}>{ingrediente}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Modo de Preparo */}
          {receita.modo_preparo && receita.modo_preparo.length > 0 && (
            <View style={styles.secaoContainer}>
              <Text style={styles.secaoTitulo}>Modo de Preparo</Text>
              {receita.modo_preparo.map((passo, index) => (
                <View key={index} style={styles.passoItem}>
                  <View style={styles.passoNumero}>
                    <Text style={styles.passoNumeroTexto}>{index + 1}</Text>
                  </View>
                  <Text style={styles.passoTexto}>{passo}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Informações Adicionais */}
          {receita.informacoes_adicionais && receita.informacoes_adicionais !== 'N/A' && (
            <View style={styles.secaoContainer}>
              <Text style={styles.secaoTitulo}>Dicas e Informações</Text>
              <Text style={styles.informacoesTexto}>
                {receita.informacoes_adicionais.replace(/\\n/g, '\n')}
              </Text>
            </View>
          )}

          {/* Botão para abrir receita */}
          {receita.link && (
            <TouchableOpacity
              style={styles.botaoAbrir}
              onPress={handleAbrirLink}
            >
              <Icon name="open-outline" size={20} color="#FFFFFF" />
              <Text style={styles.botaoAbrirTexto}>Veja na Página Original</Text>
            </TouchableOpacity>
          )}

          {/* Espaço extra */}
          <View style={styles.espacoExtra} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default ReceitaDetalhes;
