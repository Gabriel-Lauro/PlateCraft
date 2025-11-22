import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import Home from './src/pages/home/home';
import Login from './src/pages/login/login';
import Profile from './src/pages/profile/profile';
import Favoritos from './src/pages/favoritos/favoritos';
import ReceitaDetalhes from './src/pages/receitaDetalhes/receitaDetalhes';
import Surpresa from './src/pages/surpresa/surpresa';

function AppContent() {
  const { isAutenticado, loading, token } = React.useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedReceitaId, setSelectedReceitaId] = useState(null);
  const [previousTab, setPreviousTab] = useState('home');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D2691E" />
      </View>
    );
  }

  // Se não está autenticado, mostrar página de login
  if (!isAutenticado) {
    return (
      <SafeAreaView style={styles.container}>
        <Login onLoginSuccess={() => setActiveTab('home')} />
      </SafeAreaView>
    );
  }

  // Se está autenticado, mostrar o app
  return (
    <SafeAreaView style={styles.container}>
      {selectedReceitaId ? (
        <ReceitaDetalhes 
          receitaId={selectedReceitaId}
          onBack={() => {
            setSelectedReceitaId(null);
            setActiveTab('home');
          }}
        />
      ) : activeTab === 'profile' ? (
        <Profile 
          onLogout={() => setActiveTab('home')} 
          onBack={() => setActiveTab('home')}
          setActiveTab={setActiveTab}
        />
      ) : activeTab === 'favorites' ? (
        <Favoritos 
          onBack={() => setActiveTab('home')}
          onSelectReceita={setSelectedReceitaId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : activeTab === 'surprise' ? (
        <Surpresa 
          onSelectReceita={setSelectedReceitaId}
          onBack={() => setActiveTab('home')}
        />
      ) : (
        <Home activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
