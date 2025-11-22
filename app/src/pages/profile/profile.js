import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './profileStyles';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/PageHeader/PageHeader';
import BottomNav from '../../components/BottomNav/BottomNav';

const Profile = ({ onLogout, onBack, setActiveTab }) => {
  const { usuario, logout, editarPerfil } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNome, setEditNome] = useState(usuario?.nome || '');
  const [editEmail, setEditEmail] = useState(usuario?.email || '');

  useEffect(() => {
    if (usuario) {
      setEditNome(usuario.nome || '');
      setEditEmail(usuario.email || '');
    }
  }, [usuario]);

  // Botão físico de voltar do Android
  useEffect(() => {
    const onBackPress = () => {
      if (editModalVisible) {
        setEditModalVisible(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [editModalVisible, onBack]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            setLoading(true);
            try {
              const resultado = await logout();
              if (resultado.sucesso) {
                onLogout();
              } else {
                Alert.alert('Erro', resultado.erro || 'Erro ao fazer logout');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro ao fazer logout');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditarPerfil = async () => {
    if (!editNome || !editEmail) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const resultado = await editarPerfil({
        nome: editNome,
        email: editEmail,
      });

      if (resultado.sucesso) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
        setEditModalVisible(false);
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
        <LinearGradient
          colors={['#FFFBF7', '#FFFFFF', '#FFF8F0']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D2691E" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      
      <LinearGradient
        colors={['#FFFBF7', '#FFFFFF', '#FFF8F0']}
        style={styles.gradient}
      >
        <PageHeader title="Meu Perfil" onBack={onBack} />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar e Informações do Usuário */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Icon name="person" size={48} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.userName}>{usuario.nome}</Text>
              <Text style={styles.userEmail}>{usuario.email}</Text>
            </View>

            {/* Opções */}
            <View style={styles.optionsSection}>
              {/* Botão Sair */}
              <TouchableOpacity 
                style={[styles.optionButton, styles.logoutButton]}
                onPress={handleLogout}
                disabled={loading}
              >
                <View style={styles.optionContent}>
                  <Icon name="log-out" size={20} color="#FF6B6B" />
                  <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <BottomNav activeTab="profile" setActiveTab={setActiveTab} />
      </LinearGradient>

      {/* Modal de Edição */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Icon name="close" size={24} color="#333333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#CCCCCC"
                  value={editNome}
                  onChangeText={setEditNome}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu email"
                  placeholderTextColor="#CCCCCC"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleEditarPerfil}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;
