import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './BottomNavStyle';

const BottomNav = ({ activeTab, setActiveTab }) => (
  <View style={styles.bottomNav}>
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
        <View style={[styles.iconWrapper, activeTab === 'home' && styles.iconWrapperActive]}>
          <Icon name="home" size={24} color={activeTab === 'home' ? '#D2691E' : '#A0A0A0'} />
        </View>
        <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Início</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('favorites')}>
        <View style={[styles.iconWrapper, activeTab === 'favorites' && styles.iconWrapperActive]}>
          <Icon name="heart" size={24} color={activeTab === 'favorites' ? '#D2691E' : '#A0A0A0'} />
        </View>
        <Text style={[styles.navLabel, activeTab === 'favorites' && styles.navLabelActive]}>Favoritas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('surprise')}>
        <View style={[styles.iconWrapper, activeTab === 'surprise' && styles.iconWrapperActive]}>
          <Icon name="sparkles" size={24} color={activeTab === 'surprise' ? '#D2691E' : '#A0A0A0'} />
        </View>
        <Text style={[styles.navLabel, activeTab === 'surprise' && styles.navLabelActive]}>Surpresa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
        <View style={[styles.iconWrapper, activeTab === 'profile' && styles.iconWrapperActive]}>
          <Icon name="person" size={24} color={activeTab === 'profile' ? '#D2691E' : '#A0A0A0'} />
        </View>
        <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default BottomNav;
