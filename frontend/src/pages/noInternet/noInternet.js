import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import noInternetStyles from './noInternetStyles';
import { checkInternetConnection } from '../../services/networkService';

const NoInternet = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const hasConnection = await checkInternetConnection();
      if (hasConnection && onRetry) {
        onRetry();
      }
    } catch (error) {
      console.log('Erro ao verificar conexão:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <View style={noInternetStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      
      <LinearGradient
        colors={['#FFFBF7', '#FFFFFF', '#FFF8F0']}
        style={noInternetStyles.gradient}
      >
        <View style={noInternetStyles.content}>
          <View style={noInternetStyles.iconContainer}>
            <Svg width={80} height={80} viewBox="0 -960 960 960" fill="#999999">
              <Path d="M790-56 414-434q-47 11-87.5 33T254-346l-84-86q32-32 69-56t79-42l-90-90q-41 21-76.5 46.5T84-516L0-602q32-32 66.5-57.5T140-708l-84-84 56-56 736 736-58 56Zm-310-64q-42 0-71-29.5T380-220q0-42 29-71t71-29q42 0 71 29t29 71q0 41-29 70.5T480-120Zm236-238-29-29-29-29-144-144q81 8 151.5 41T790-432l-74 74Zm160-158q-77-77-178.5-120.5T480-680q-21 0-40.5 1.5T400-674L298-776q44-12 89.5-18t92.5-6q142 0 265 53t215 145l-84 86Z" />
            </Svg>
          </View>

          <Text style={noInternetStyles.title}>
            Sem Conexão
          </Text>

          <Text style={noInternetStyles.description}>
            Verifique sua conexão com a internet
          </Text>

          <TouchableOpacity 
            style={noInternetStyles.retryButton}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={noInternetStyles.retryButtonText}>
                  Verificando...
                </Text>
              </>
            ) : (
              <>
                <Icon name="refresh" size={20} color="#FFFFFF" />
                <Text style={noInternetStyles.retryButtonText}>
                  Tentar Novamente
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default NoInternet;
