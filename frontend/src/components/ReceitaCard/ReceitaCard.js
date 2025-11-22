import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './ReceitaCardStyle';

const ReceitaCard = ({ 
  item, 
  onPress, 
  onFavoritar, 
  isFavoritado,
  showDataFavoritado = false 
}) => {
  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => onPress(item.id)}
      >
        <View style={styles.cardImage}>
          {item.imagem ? (
            <Image
              source={{ uri: item.imagem }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="images" size={50} color="#CD7F32" />
            </View>
          )}
          
          {/* Botão de favoritar */}
          <TouchableOpacity
            style={styles.favoritoButton}
            onPress={(e) => onFavoritar(item.id, e)}
          >
            <Icon 
              name={isFavoritado ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavoritado ? "#FF6B6B" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.receitaNome} numberOfLines={2}>
            {item.titulo}
          </Text>
          <View style={styles.receitaTempo}>
            <Icon name="hourglass" size={14} color="#666666" />
            <Text style={styles.receitaTempoText}>
              {item.tempo_preparo || 'N/A'}
            </Text>
          </View>
          <View style={styles.receitaInfo}>
            <View style={styles.receitaNotaContainer}>
              <Icon name="star" size={14} color="#CD7F32" />
              <Text style={styles.receitaNota}>{item.nota || 'N/A'}</Text>
            </View>
            <Text style={styles.receitaAvaliacoes}>{item.avaliacoes || 'N/A'}</Text>
          </View>
          {showDataFavoritado && item.data_favoritado && (
            <Text style={styles.dataFavoritado}>
              {new Date(item.data_favoritado).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ReceitaCard;
