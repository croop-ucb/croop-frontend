import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { AuthStackParamList, RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';
import CroopLogo from '../../components/CroopLogo';
import { login } from '../../services/authService';
import { setToken } from '../../services/tokenStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async () => {
    setErro(null);

    if (!email.trim() || !password) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      setToken(data.access_token);
      navigation
        .getParent<NativeStackNavigationProp<RootStackParamList>>()
        ?.navigate('PlantList');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErro('E-mail ou senha incorretos.');
      } else {
        setErro('Erro de conexão. Verifique sua internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <CroopLogo />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <Text style={styles.titlePage}>Login</Text>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {erro && <Text style={styles.erroText}>{erro}</Text>}

            <TouchableOpacity style={styles.buttonMain} onPress={handleLogin} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.buttonText}>Entrar</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkGreen}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não possui conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerText, styles.linkBold]}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  titlePage: { color: '#FFF', fontSize: 32, marginBottom: 30, fontWeight: '300' },
  form: { width: '100%', alignItems: 'center' },
  label: { color: '#4CAF50', alignSelf: 'flex-start', fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
  input: {
    width: '100%', height: 45, backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20, marginBottom: 20, paddingHorizontal: 15, color: '#FFF',
  },
  erroText: {
    color: '#FF6B6B', fontSize: 13, textAlign: 'center',
    marginBottom: 10, marginTop: -8,
  },
  buttonMain: {
    backgroundColor: '#4CAF50', width: 160, height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkGreen: { color: '#4CAF50', marginTop: 15, textDecorationLine: 'underline', fontSize: 12 },
  footer: { flexDirection: 'row', marginTop: 40 },
  footerText: { color: '#FFF', fontSize: 14, opacity: 0.7 },
  linkBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
});
