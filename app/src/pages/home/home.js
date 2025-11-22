import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import baseStyles from './homeStyles';
import Logo from '../../components/Logo/Logo';
import SearchBar from '../../components/SearchBar/SearchBar';
import DescriptionText from '../../components/DescriptionText/DescriptionText';
import BottomNav from '../../components/BottomNav/BottomNav';
import Results from '../results/results';
import ReceitaDetalhes from '../receitaDetalhes/receitaDetalhes';
import Favoritos from '../favoritos/favoritos';

// Função para normalizar texto (remove acentos e converte para minúsculas)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const Home = ({ activeTab, setActiveTab }) => {
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showFavoritos, setShowFavoritos] = useState(false);
  const [selectedIngredientes, setSelectedIngredientes] = useState([]);
  const [selectedReceitaId, setSelectedReceitaId] = useState(null);

  const handleAddIngredient = (ingredient) => {
    // Verificar se já foi selecionado (comparando versões normalizadas)
    const isAlreadySelected = selectedIngredientes.some(
      (ing) => normalizeText(ing) === normalizeText(ingredient)
    );
    
    if (!isAlreadySelected) {
      setSelectedIngredientes([...selectedIngredientes, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setSelectedIngredientes(
      selectedIngredientes.filter(ing => ing !== ingredient)
    );
  };

  const handleSearch = () => {
    if (selectedIngredientes.length > 0) {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    setShowResults(false);
    setSearchText('');
    setSelectedIngredientes([]);
  };

  const handleSelectReceita = (receitaId) => {
    setSelectedReceitaId(receitaId);
  };

  const handleBackFromDetalhes = () => {
    setSelectedReceitaId(null);
  };

  // Botão físico de voltar do Android
  useEffect(() => {
    const onBackPress = () => {
      if (selectedReceitaId) {
        handleBackFromDetalhes();
        return true;
      }
      if (showResults) {
        handleBack();
        return true;
      }
      return false; // deixa o sistema lidar (sair do app)
    };

    const { BackHandler } = require('react-native');
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedReceitaId, showResults]);

  // Tela de detalhes da receita
  if (selectedReceitaId) {
    return (
      <ReceitaDetalhes 
        receitaId={selectedReceitaId}
        onBack={handleBackFromDetalhes}
      />
    );
  }

  // Tela de resultados
  if (showResults) {
    return (
      <Results 
        ingredientes={selectedIngredientes} 
        onBack={handleBack}
        onSelectReceita={handleSelectReceita}
      />
    );
  }

  return (
    <View style={baseStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      
      <LinearGradient
        colors={['#FFFBF7', '#FFFFFF', '#FFF8F0']}
        style={baseStyles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={baseStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            <Logo />
            <SearchBar 
              value={searchText} 
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              selectedIngredients={selectedIngredientes}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
            />
            <DescriptionText>
              Descreva quais ingredientes você tem em sua casa{"\n"}e eu te ajudo a encontrar a receita perfeita ✨
            </DescriptionText>
          </ScrollView>

          {/* Botão de busca removido conforme solicitação */}
        </KeyboardAvoidingView>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </LinearGradient>
    </View>
  );
};

export default Home;