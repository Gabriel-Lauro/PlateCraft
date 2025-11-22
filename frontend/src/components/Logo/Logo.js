import React from 'react';
import { View, Image } from 'react-native';
import styles from './LogoStyle';

const Logo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Image
        source={require('../../media/img/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default Logo;
