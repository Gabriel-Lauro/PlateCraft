import React from 'react';
import { Text } from 'react-native';
import styles from './DescriptionTextStyle';

const DescriptionText = ({ children }) => (
  <Text style={styles.descriptionText}>{children}</Text>
);

export default DescriptionText;
