import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './SearchBarStyle';
import ingredientes from '../../media/dictionary';

// Função para normalizar texto (remove acentos e converte para minúsculas)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const SearchBar = ({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = 'O que você gostaria de cozinhar hoje?',
  selectedIngredients = [],
  onAddIngredient,
  onRemoveIngredient,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtrar e ordenar sugestões baseado no texto digitado
  const suggestions = useMemo(() => {
    if (!value.trim()) return [];

    const normalizedSearchTerm = normalizeText(value.trim());
    
    // Separar em categorias de relevância
    const exactMatches = [];
    const startsWithMatches = [];
    const includesMatches = [];

    ingredientes.forEach((ing) => {
      const normalizedIng = normalizeText(ing);
      
      // Pular se já foi selecionado
      if (selectedIngredients.includes(ing)) return;

      // Correspondência exata
      if (normalizedIng === normalizedSearchTerm) {
        exactMatches.push(ing);
      }
      // Começa com o termo
      else if (normalizedIng.startsWith(normalizedSearchTerm)) {
        startsWithMatches.push(ing);
      }
      // Contém o termo
      else if (normalizedIng.includes(normalizedSearchTerm)) {
        includesMatches.push(ing);
      }
    });

    // Combinar em ordem de relevância
    const sorted = [
      ...exactMatches,
      ...startsWithMatches.sort(),
      ...includesMatches.sort(),
    ].slice(0, 12); // Aumentar limite para permitir scroll

    return sorted;
  }, [value, selectedIngredients]);

  const handleSelectSuggestion = (ingredient) => {
    if (onAddIngredient) {
      onAddIngredient(ingredient);
    }
    onChangeText('');
    setShowSuggestions(false);
  };

  const handleAddCustomIngredient = () => {
    if (!value.trim() || !onAddIngredient) return;

    const userInput = value.trim();
    const normalizedSearchTerm = normalizeText(userInput);

    // Evitar duplicados (comparando versões normalizadas)
    const isAlreadySelected = selectedIngredients.some(
      (ing) => normalizeText(ing) === normalizedSearchTerm
    );
    if (isAlreadySelected) {
      // Apenas limpar o input e fechar as sugestões
      onChangeText('');
      setShowSuggestions(false);
      return;
    }

    // Adiciona exatamente o que o usuário digitou, mesmo que não esteja no dicionário
    onAddIngredient(userInput);

    // Limpar o input e fechar sugestões
    onChangeText('');
    setShowSuggestions(false);
  };

  return (
    <View style={styles.searchContainer}>
      {/* Pins dos ingredientes selecionados */}
      {selectedIngredients.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pinsContainer}
          contentContainerStyle={styles.pinsContent}
          keyboardShouldPersistTaps="always"
        >
          {selectedIngredients.map((ingredient, index) => (
            <View key={index} style={styles.pin}>
              <Text style={styles.pinText}>{ingredient}</Text>
              <TouchableOpacity
                onPress={() => onRemoveIngredient(ingredient)}
                style={styles.pinCloseButton}
              >
                <Icon name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input de busca */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#B0A090"
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setShowSuggestions(text.length > 0);
          }}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (value.trim()) {
              handleAddCustomIngredient();
            } else if (onSubmitEditing) {
              onSubmitEditing();
            }
          }}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            if (value.trim()) {
              handleAddCustomIngredient();
            } else if (onSubmitEditing) {
              onSubmitEditing();
            }
          }}
        >
          <Icon name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Dropdown de sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <ScrollView
          scrollEnabled={true}
          style={styles.suggestionsContainer}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          onStartShouldSetResponderCapture={() => true}
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchBar;
