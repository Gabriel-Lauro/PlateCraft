import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './loginStyles';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo/Logo';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { login, registro } = useAuth();

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }

    setLoading(true);
    try {
      const resultado = await login(email, senha);
      
      if (resultado.sucesso) {
        setEmail('');
        setSenha('');
        onLoginSuccess();
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro ao fazer login');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!nome || !email || !senha || !senhaConfirm) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senha !== senhaConfirm) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const resultado = await registro(nome, email, senha);
      
      if (resultado.sucesso) {
        setNome('');
        setEmail('');
        setSenha('');
        setSenhaConfirm('');
        onLoginSuccess();
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro ao registrar');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      
      <LinearGradient
        colors={['#FFFBF7', '#FFFFFF', '#FFF8F0']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.logoContainer}>
              <Logo />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>
                {isLogin ? 'Bem-vindo!' : 'Criar Conta'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Faça login para acessar suas receitas' 
                  : 'Crie uma conta para começar'}
              </Text>

              {/* Campo de Nome (apenas no registro) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Icon name="person" size={20} color="#D2691E" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#CCCCCC"
                    value={nome}
                    onChangeText={setNome}
                    editable={!loading}
                  />
                </View>
              )}

              {/* Campo de Email */}
              <View style={styles.inputContainer}>
                <Icon name="mail" size={20} color="#D2691E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#CCCCCC"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Campo de Senha */}
              <View style={styles.inputContainer}>
                <Icon name="lock-closed" size={20} color="#D2691E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#CCCCCC"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon 
                    name={showPassword ? 'eye' : 'eye-off'} 
                    size={20} 
                    color="#D2691E" 
                  />
                </TouchableOpacity>
              </View>

              {/* Campo de Confirmação de Senha (apenas no registro) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed" size={20} color="#D2691E" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#CCCCCC"
                    value={senhaConfirm}
                    onChangeText={setSenhaConfirm}
                    secureTextEntry={!showPasswordConfirm}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    style={styles.eyeIcon}
                  >
                    <Icon 
                      name={showPasswordConfirm ? 'eye' : 'eye-off'} 
                      size={20} 
                      color="#D2691E" 
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Botão de Login/Registro */}
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={isLogin ? handleLogin : handleRegistro}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Link para alternar entre login e registro */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setIsLogin(!isLogin);
                    setNome('');
                    setEmail('');
                    setSenha('');
                    setSenhaConfirm('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.toggleLink}>
                    {isLogin ? 'Registre-se' : 'Faça login'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

export default Login;
