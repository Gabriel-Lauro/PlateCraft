import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './SkeletonDetalhesStyle';

const SkeletonDetalhes = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-500, 500],
  });

  const renderShimmer = () => (
    <Animated.View
      style={[
        styles.shimmerOverlay,
        { transform: [{ translateX }] },
      ]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shimmerGradient}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Imagem grande */}
      <View style={styles.imagemContainer}>
        <View style={styles.imagem} />
        {renderShimmer()}
      </View>

      {/* Título e botão favoritar */}
      <View style={styles.tituloContainer}>
        <View style={styles.tituloLine} />
        {renderShimmer()}
      </View>

      {/* Info container (nota, avaliações, tempo) */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon} />
          <View style={styles.infoTexto}>
            <View style={styles.infoLabel} />
            <View style={styles.infoValor} />
          </View>
          {renderShimmer()}
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon} />
          <View style={styles.infoTexto}>
            <View style={styles.infoLabel} />
            <View style={styles.infoValor} />
          </View>
          {renderShimmer()}
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon} />
          <View style={styles.infoTexto}>
            <View style={styles.infoLabel} />
            <View style={styles.infoValor} />
          </View>
          {renderShimmer()}
        </View>
      </View>

      {/* Autor */}
      <View style={styles.autorContainer}>
        <View style={styles.autorIcon} />
        <View style={styles.autorTexto}>
          <View style={styles.autorLabel} />
          <View style={styles.autorNome} />
        </View>
        {renderShimmer()}
      </View>

      {/* Seção 1 - Descrição */}
      <View style={styles.secaoContainer}>
        <View style={styles.secaoTitulo} />
        <View style={styles.linhaTexto} />
        <View style={styles.linhaTexto} />
        <View style={[styles.linhaTexto, styles.linhaTextoMenor]} />
        {renderShimmer()}
      </View>

      {/* Seção 2 - Ingredientes */}
      <View style={styles.secaoContainer}>
        <View style={styles.secaoTitulo} />
        <View style={styles.ingredienteItem} />
        <View style={styles.ingredienteItem} />
        <View style={styles.ingredienteItem} />
        {renderShimmer()}
      </View>

      {/* Seção 3 - Modo de Preparo */}
      <View style={styles.secaoContainer}>
        <View style={styles.secaoTitulo} />
        <View style={styles.passoItem} />
        <View style={styles.passoItem} />
        <View style={styles.passoItem} />
        {renderShimmer()}
      </View>
    </View>
  );
};

export default SkeletonDetalhes;
