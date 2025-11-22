import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './SkeletonLoaderStyle';

const SkeletonLoader = () => {
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

  return (
    <View style={styles.skeletonCard}>
      {/* Imagem do esqueleto */}
      <View style={styles.skeletonImageContainer}>
        <View style={styles.skeletonImage} />
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
      </View>

      {/* Conteúdo do esqueleto */}
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLineContainer}>
          <View style={[styles.skeletonLine, styles.skeletonTitle]} />
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
        </View>

        <View style={styles.skeletonLineContainer}>
          <View style={[styles.skeletonLine, styles.skeletonSubtitle]} />
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
        </View>

        <View style={styles.skeletonLineContainer}>
          <View style={[styles.skeletonLine, styles.skeletonText]} />
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
        </View>
      </View>
    </View>
  );
};

export default SkeletonLoader;
